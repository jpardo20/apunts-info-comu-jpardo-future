(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', initFormEngine);

  async function initFormEngine() {
    const root = document.getElementById('formRoot');
    if (!root) return;

    const formJsonPath = root.dataset.formJson;
    const studentsJsonPath = root.dataset.studentsJson;
    const cycle = root.dataset.cycle || '';
    const formId = root.dataset.formId || formJsonPath || 'formulari-sense-id';

    const progressLabel = document.getElementById('progressLabel');
    const progressFill = document.getElementById('progressFill');
    const messagesBox = document.getElementById('formMessages');
    const checkMissingBtn = document.getElementById('checkMissingBtn');
    const calcScoreBtn = document.getElementById('calcScoreBtn');
    const saveProgressBtn = document.getElementById('saveProgressBtn');
    const downloadJsonBtn = document.getElementById('downloadJsonBtn');

    if (!formJsonPath || !studentsJsonPath) {
      showMessage(
        messagesBox,
        'Error de configuració: falta la ruta del formulari o de dades d\'alumnes.',
        'error'
      );
      return;
    }

    let formDef;
    let studentsData;

    try {
      [formDef, studentsData] = await Promise.all([
        fetchJson(formJsonPath),
        fetchJson(studentsJsonPath)
      ]);
    } catch (err) {
      console.error(err);
      showMessage(
        messagesBox,
        'No s\'han pogut carregar les dades del formulari o dels alumnes.',
        'error'
      );
      return;
    }

    const students = Array.isArray(studentsData.students) ? studentsData.students : [];
    const studentsForCycle = cycle
      ? students.filter(function (s) { return s.cycle === cycle; })
      : students.slice();

    // Construïm el formulari dins de root
    const formEl = document.createElement('form');
    formEl.id = 'dynamicForm';
    formEl.className = 'form-container';
    formEl.setAttribute('novalidate', 'novalidate');

    // Bloc selector alumne
    const studentBlock = buildStudentSelectorBlock(formDef, studentsForCycle, cycle);
    formEl.appendChild(studentBlock);

    // Bloc de preguntes
    if (Array.isArray(formDef.questions)) {
      formDef.questions.forEach(function (q, index) {
        const qEl = buildQuestionElement(q, index + 1);
        formEl.appendChild(qEl);
      });
    }

    root.appendChild(formEl);

    // Claus per a localStorage
    const storageKey = 'form-progress:' + formId;
    const attemptsKey = 'form-attempts:' + formId;

    // Restaurar progrés si existeix
    restoreProgress(storageKey, formDef, root);
    updateProgress(root, progressLabel, progressFill);

    // Quan es modifica algun camp → actualitzar progrés i treure error visual
    formEl.addEventListener('input', function (e) {
      if (e.target && e.target.closest('.question')) {
        clearQuestionError(e.target.closest('.question'));
        updateProgress(root, progressLabel, progressFill);
      }
    });
    formEl.addEventListener('change', function (e) {
      if (e.target && e.target.closest('.question')) {
        clearQuestionError(e.target.closest('.question'));
        updateProgress(root, progressLabel, progressFill);
      }
    });

    // Botó: comprovar preguntes obligatòries
    if (checkMissingBtn) {
      checkMissingBtn.addEventListener('click', function () {
        const missing = validateRequired(root);
        if (missing.length === 0) {
          showMessage(
            messagesBox,
            'Formulari complet: no falta cap resposta obligatòria.',
            'success'
          );
        } else {
          showMessage(
            messagesBox,
            'Falten respostes en ' + missing.length +
              ' pregunta(es) obligatòria(es). Revisa els camps marcats.',
            'warning'
          );
        }
        updateProgress(root, progressLabel, progressFill);
      });
    }

    // Botó: desar progrés al navegador
    if (saveProgressBtn) {
      saveProgressBtn.addEventListener('click', function () {
        const payload = buildSubmissionPayload(
          formDef,
          root,
          storageKey,
          attemptsKey,
          false
        );
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(payload));
          showMessage(messagesBox, 'Progrés desat en aquest navegador.', 'success');
        } catch (e) {
          console.error(e);
          showMessage(
            messagesBox,
            'No s\'ha pogut desar el progrés (quota de memòria plena?).',
            'error'
          );
        }
      });
    }

    // Botó: descarregar fitxer JSON
    if (downloadJsonBtn) {
      downloadJsonBtn.addEventListener('click', function () {
        const payload = buildSubmissionPayload(
          formDef,
          root,
          storageKey,
          attemptsKey,
          true
        );

        const student = payload.student || {};
        const baseLabel = student.name || 'sense-alumne';
        const cognomNom = slugifyStudentLabelToCognomNom(baseLabel);
        const ts = formatTimestampForFilename(new Date());

        const filename =
          ts + '-' + (formDef.id || 'formulari') + '-' + cognomNom + '.json';

        const blob = new Blob([JSON.stringify(payload, null, 2)], {
          type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showMessage(
          messagesBox,
          'Fitxer JSON descarregat. Recorda pujar-lo al campus virtual.',
          'success'
        );
      });
    }

    // Botó: calcular nota orientativa
    if (calcScoreBtn) {
      calcScoreBtn.addEventListener('click', function () {
        const payload = buildSubmissionPayload(
          formDef,
          root,
          storageKey,
          attemptsKey,
          false
        );
        // Nombre d'intents
        var attempts = 0;
        try {
          attempts = parseInt(
            window.localStorage.getItem(attemptsKey) || '0',
            10
          );
        } catch (e) {
          attempts = 0;
        }
        attempts += 1;
        try {
          window.localStorage.setItem(attemptsKey, String(attempts));
        } catch (e) {
          // ignore
        }

        const scoreInfo = computeScore(formDef, payload.answers);
        const nota = scoreInfo.scoreOver10;
        var notaPenalitzada = nota;

        if (attempts >= 2) {
          // Penalització simple del 10% a partir del 2n intent
          notaPenalitzada = Math.round(nota * 0.9 * 100) / 100;
        }

        const msg =
          'Nota orientativa (automàtica, només preguntes tancades): ' +
          nota.toFixed(2) +
          ' / 10.\n' +
          (attempts >= 2
            ? 'Aquesta és almenys la teva ' +
              attempts +
              "a correcció automàtica. Nota penalitzada (-10%): " +
              notaPenalitzada.toFixed(2) +
              ' / 10.'
            : 'Encara sense penalització. A partir del segon càlcul s\'aplicarà una penalització del 10%.');

        showMessage(messagesBox, msg.replace(/\n/g, '<br>'), 'info');
      });
    }
  }

  // ---------- Construcció de blocs ----------

  function buildStudentSelectorBlock(formDef, studentsForCycle, cycle) {
    const block = document.createElement('div');
    block.className = 'question question--student';
    block.dataset.type = 'student';
    block.dataset.required = 'true';

    const label = document.createElement('label');
    label.setAttribute('for', 'studentSelect');
    label.innerHTML =
      'Alumne/a <span class="required-mark">*</span>';

    const select = document.createElement('select');
    select.id = 'studentSelect';
    select.name = 'studentId';
    select.setAttribute('data-required', 'true');

    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = '─ Tria el teu nom de la llista ─';
    select.appendChild(defaultOpt);

    if (studentsForCycle.length > 0) {
      studentsForCycle.forEach(function (s) {
        const opt = document.createElement('option');
        opt.value = s.id;
        var label = s.name;
        if (s.group) {
          label += ' (' + s.group + ')';
        }
        opt.textContent = label;
        select.appendChild(opt);
      });
    }

    const status = document.createElement('div');
    status.className = 'status-text';
    status.id = 'studentsStatus';

    if (studentsForCycle.length === 0) {
      status.textContent =
        'No s\'ha trobat cap alumne per al cicle ' +
        (cycle || formDef.cycle || '') +
        '. Revisa el fitxer dades_alumnes.json.';
      block.classList.add('question--error');
    } else {
      status.textContent =
        'Cicle: ' +
        (formDef.cycle || cycle || 'No definit') +
        ' · Alumnes carregats: ' +
        studentsForCycle.length;
    }

    const meta = document.createElement('div');
    meta.className = 'question-meta';
    meta.textContent =
      'Mòdul ' +
      (formDef.module || '') +
      (formDef.moduleName ? ' · ' + formDef.moduleName : '');

    block.appendChild(label);
    block.appendChild(select);
    block.appendChild(status);
    block.appendChild(meta);

    return block;
  }

  function buildQuestionElement(q, index) {
    const wrapper = document.createElement('div');
    wrapper.className = 'question';
    wrapper.dataset.questionId = q.id;
    wrapper.dataset.type = q.type || 'short_text';
    if (q.required) {
      wrapper.dataset.required = 'true';
    }

    const label = document.createElement('label');
    const labelId = 'q-' + q.id;
    label.setAttribute('for', labelId);
    label.innerHTML =
      escapeHtml(q.label || ('Pregunta ' + index)) +
      (q.required ? ' <span class="required-mark">*</span>' : '');
    wrapper.appendChild(label);

    if (q.helpText) {
      const help = document.createElement('div');
      help.className = 'help-text';
      help.textContent = q.helpText;
      wrapper.appendChild(help);
    }

    var fieldContainer;

    switch (q.type) {
      case 'short_text':
        fieldContainer = buildShortTextField(labelId, q);
        break;
      case 'single_choice':
        fieldContainer = buildSingleChoiceField(q);
        break;
      case 'true_false':
        fieldContainer = buildTrueFalseField(q);
        break;
      case 'matching':
        fieldContainer = buildMatchingField(q);
        break;
      case 'capture':
        fieldContainer = buildCaptureField(q);
        break;
      default:
        fieldContainer = buildShortTextField(labelId, q);
        break;
    }

    wrapper.appendChild(fieldContainer);
    return wrapper;
  }

  function buildShortTextField(id, q) {
    const container = document.createElement('div');
    container.className = 'question-body';

    const textarea = document.createElement('textarea');
    textarea.id = id;
    textarea.name = q.id;
    textarea.rows = 3;
    if (q.max_length) {
      textarea.maxLength = q.max_length;
    }

    container.appendChild(textarea);
    return container;
  }

  function buildSingleChoiceField(q) {
    const container = document.createElement('div');
    container.className = 'question-body question-body--options';

    const name = q.id;
    if (Array.isArray(q.options)) {
      q.options.forEach(function (opt, idx) {
        const optId = 'q-' + q.id + '-' + idx;

        const wrapper = document.createElement('div');
        wrapper.className = 'option';

        const input = document.createElement('input');
        input.type = 'radio';
        input.id = optId;
        input.name = name;
        input.value = opt.value;

        const label = document.createElement('label');
        label.setAttribute('for', optId);
        label.textContent = opt.text;

        wrapper.appendChild(input);
        wrapper.appendChild(label);
        container.appendChild(wrapper);
      });
    }

    return container;
  }

  function buildTrueFalseField(q) {
    const container = document.createElement('div');
    container.className = 'question-body question-body--options';

    const name = q.id;
    const options = [
      { value: 'true', text: 'Verdader' },
      { value: 'false', text: 'Fals' }
    ];

    options.forEach(function (opt, idx) {
      const optId = 'q-' + q.id + '-' + idx;

      const wrapper = document.createElement('div');
      wrapper.className = 'option';

      const input = document.createElement('input');
      input.type = 'radio';
      input.id = optId;
      input.name = name;
      input.value = opt.value;

      const label = document.createElement('label');
      label.setAttribute('for', optId);
      label.textContent = opt.text;

      wrapper.appendChild(input);
      wrapper.appendChild(label);
      container.appendChild(wrapper);
    });

    return container;
  }

  function buildMatchingField(q) {
    const container = document.createElement('div');
    container.className = 'question-body question-body--matching';

    const left = Array.isArray(q.left) ? q.left : [];
    const right = Array.isArray(q.right) ? q.right : [];

    left.forEach(function (leftText, idx) {
      const row = document.createElement('div');
      row.className = 'matching-row';

      const leftSpan = document.createElement('span');
      leftSpan.className = 'matching-left';
      leftSpan.textContent = leftText;

      const select = document.createElement('select');
      select.name = q.id + '-match-' + idx;
      select.className = 'matching-select';

      const defaultOpt = document.createElement('option');
      defaultOpt.value = '';
      defaultOpt.textContent = '─ Tria ─';
      select.appendChild(defaultOpt);

      right.forEach(function (rightText, rIdx) {
        const opt = document.createElement('option');
        opt.value = String(rIdx);
        opt.textContent = rightText;
        select.appendChild(opt);
      });

      row.appendChild(leftSpan);
      row.appendChild(select);
      container.appendChild(row);
    });

    return container;
  }

  function buildCaptureField(q) {
    const container = document.createElement('div');
    container.className = 'question-body question-body--capture';

    const instructions = document.createElement('div');
    instructions.className = 'capture-instructions';
    instructions.textContent =
      q.helpText ||
      'Fes la captura amb l’eina que vulguis i enganxa-la directament aquí (Ctrl+V).';

    const area = document.createElement('div');
    area.className = 'capture-area';
    area.tabIndex = 0;
    area.textContent = 'Copia i enganxa aquí la captura (Ctrl+V)...';

    const preview = document.createElement('div');
    preview.className = 'capture-preview';

    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = q.id;

    area.addEventListener('paste', function (e) {
      const items = e.clipboardData && e.clipboardData.items;
      if (!items) {
        return;
      }
      var foundImage = false;
      for (var i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') === 0) {
          foundImage = true;
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = function (ev) {
              hiddenInput.value = ev.target.result || '';
              preview.innerHTML = '';
              const img = document.createElement('img');
              img.src = hiddenInput.value;
              img.alt = 'Captura enganxada';
              preview.appendChild(img);
            };
            reader.readAsDataURL(file);
          }
        }
      }
      if (foundImage) {
        e.preventDefault();
      }
    });

    container.appendChild(instructions);
    container.appendChild(area);
    container.appendChild(preview);
    container.appendChild(hiddenInput);

    return container;
  }

  // ---------- Progrés i validació ----------

  function updateProgress(root, progressLabel, progressFill) {
    if (!progressLabel || !progressFill) return;

    const requiredQuestions = Array.prototype.slice.call(
      root.querySelectorAll('.question[data-required="true"]')
    );
    if (requiredQuestions.length === 0) {
      progressLabel.textContent = '0% completat';
      progressFill.style.width = '0%';
      return;
    }

    const answered = requiredQuestions.filter(function (qEl) {
      return isQuestionAnswered(qEl);
    });

    const percent = Math.round(
      (answered.length / requiredQuestions.length) * 100
    );
    progressLabel.textContent = percent + '% completat';
    progressFill.style.width = percent + '%';
  }

  function isQuestionAnswered(qEl) {
    const type = qEl.dataset.type || 'short_text';

    if (type === 'student') {
      const select = qEl.querySelector('select');
      return !!(select && select.value);
    }

    if (type === 'short_text') {
      const input = qEl.querySelector('textarea, input[type="text"]');
      return !!(input && input.value.trim() !== '');
    }

    if (type === 'single_choice' || type === 'true_false') {
      const checked = qEl.querySelector('input[type="radio"]:checked');
      return !!checked;
    }

    if (type === 'matching') {
      const selects = Array.prototype.slice.call(qEl.querySelectorAll('select'));
      if (selects.length === 0) return false;
      return selects.every(function (sel) {
        return !!sel.value;
      });
    }

    if (type === 'capture') {
      const hidden = qEl.querySelector('input[type="hidden"]');
      return !!(hidden && hidden.value);
    }

    // Per defecte
    const anyInput = qEl.querySelector('input, textarea, select');
    return !!(anyInput && anyInput.value && String(anyInput.value).trim() !== '');
  }

  function validateRequired(root) {
    const missing = [];
    const requiredQuestions = Array.prototype.slice.call(
      root.querySelectorAll('.question[data-required="true"]')
    );

    requiredQuestions.forEach(function (qEl) {
      if (!isQuestionAnswered(qEl)) {
        qEl.classList.add('question--error');
        missing.push(qEl);
      } else {
        qEl.classList.remove('question--error');
      }
    });

    return missing;
  }

  function clearQuestionError(qEl) {
    if (qEl && qEl.classList) {
      qEl.classList.remove('question--error');
    }
  }

  // ---------- Progrés: desar i restaurar ----------

  function restoreProgress(storageKey, formDef, root) {
    if (!window.localStorage) return;
    var raw;
    try {
      raw = window.localStorage.getItem(storageKey);
    } catch (e) {
      return;
    }
    if (!raw) return;

    var payload;
    try {
      payload = JSON.parse(raw);
    } catch (e) {
      console.error(e);
      return;
    }
    if (!payload || typeof payload !== 'object') return;

    // Alumne
    if (payload.student && payload.student.id) {
      const studentSelect = root.querySelector('#studentSelect');
      if (studentSelect) {
        studentSelect.value = payload.student.id;
      }
    }

    // Respostes
    const answers = payload.answers || {};
    Object.keys(answers).forEach(function (qid) {
      const value = answers[qid];
      const qDef = (formDef.questions || []).find(function (q) {
        return q.id === qid;
      });
      if (!qDef) return;

      const qType = qDef.type || 'short_text';
      const qEl = root.querySelector(
        '.question[data-question-id="' + qid + '"]'
      );
      if (!qEl) return;

      if (qType === 'short_text') {
        const input = qEl.querySelector('textarea, input[type="text"]');
        if (input) {
          input.value = String(value || '');
        }
      } else if (qType === 'single_choice' || qType === 'true_false') {
        const radios = qEl.querySelectorAll('input[type="radio"]');
        Array.prototype.forEach.call(radios, function (r) {
          r.checked = r.value === value;
        });
      } else if (qType === 'matching' && Array.isArray(value)) {
        const selects = Array.prototype.slice.call(
          qEl.querySelectorAll('select')
        );
        selects.forEach(function (sel, idx) {
          if (typeof value[idx] !== 'undefined' && value[idx] !== null) {
            sel.value = String(value[idx]);
          }
        });
      } else if (qType === 'capture') {
        const hidden = qEl.querySelector('input[type="hidden"]');
        const preview = qEl.querySelector('.capture-preview');
        if (hidden && typeof value === 'string' && value) {
          hidden.value = value;
          if (preview) {
            preview.innerHTML = '';
            const img = document.createElement('img');
            img.src = value;
            img.alt = 'Captura carregada';
            preview.appendChild(img);
          }
        }
      }
    });
  }

  function buildSubmissionPayload(
    formDef,
    root,
    storageKey,
    attemptsKey,
    includeScore
  ) {
    const studentSelect = root.querySelector('#studentSelect');
    const studentId = studentSelect ? studentSelect.value : '';
    const studentName = studentSelect
      ? (studentSelect.options[studentSelect.selectedIndex] || {}).textContent || ''
      : '';

    const answers = {};
    (formDef.questions || []).forEach(function (q) {
      const qId = q.id;
      const qType = q.type || 'short_text';
      const qEl = root.querySelector(
        '.question[data-question-id="' + qId + '"]'
      );
      if (!qEl) return;

      if (qType === 'short_text') {
        const input = qEl.querySelector('textarea, input[type="text"]');
        answers[qId] = input ? input.value : '';
      } else if (qType === 'single_choice' || qType === 'true_false') {
        const checked = qEl.querySelector('input[type="radio"]:checked');
        answers[qId] = checked ? checked.value : null;
      } else if (qType === 'matching') {
        const selects = Array.prototype.slice.call(
          qEl.querySelectorAll('select')
        );
        answers[qId] = selects.map(function (sel) {
          return sel.value === '' ? null : parseInt(sel.value, 10);
        });
      } else if (qType === 'capture') {
        const hidden = qEl.querySelector('input[type="hidden"]');
        answers[qId] = hidden ? hidden.value : '';
      } else {
        const anyInput = qEl.querySelector('input, textarea, select');
        answers[qId] = anyInput ? anyInput.value : '';
      }
    });

    var attempts = 0;
    try {
      attempts = parseInt(
        window.localStorage.getItem(attemptsKey) || '0',
        10
      );
    } catch (e) {
      attempts = 0;
    }

    const payload = {
      form_id: formDef.id || '',
      form_title: formDef.title || '',
      cycle: formDef.cycle || '',
      module: formDef.module || '',
      moduleName: formDef.moduleName || '',
      timestamp: new Date().toISOString(),
      student: {
        id: studentId || null,
        name: studentName || null
      },
      attempts: attempts,
      answers: answers
    };

    // Marca d'integritat "discreta"
    payload.integrity = {
      algo: 'v1',
      h: computeIntegrity(formDef, studentId, answers)
    };

    if (includeScore) {
      payload.score = computeScore(formDef, answers);
    }

    return payload;
  }

  function computeScore(formDef, answers) {
    var rawScore = 0;
    var maxScore = 0;

    (formDef.questions || []).forEach(function (q) {
      const qId = q.id;
      const qType = q.type || 'short_text';
      const weight = typeof q.weight === 'number' ? q.weight : 1;
      const ans = answers[qId];

      if (qType === 'single_choice') {
        const correctOpt = (q.options || []).find(function (o) {
          return o.is_correct;
        });
        if (correctOpt && ans != null) {
          maxScore += weight;
          if (ans === correctOpt.value) {
            rawScore += weight;
          }
        }
      } else if (qType === 'true_false') {
        if (typeof q.correct === 'boolean') {
          maxScore += weight;
          if (ans != null) {
            const ansBool = ans === 'true';
            if (ansBool === q.correct) {
              rawScore += weight;
            }
          }
        }
      } else if (qType === 'matching') {
        if (Array.isArray(q.correct)) {
          maxScore += weight;
          if (Array.isArray(ans)) {
            var allMatch = q.correct.length === ans.length;
            if (allMatch) {
              for (var i = 0; i < q.correct.length; i++) {
                if (ans[i] !== q.correct[i]) {
                  allMatch = false;
                  break;
                }
              }
            }
            if (allMatch) {
              rawScore += weight;
            }
          }
        }
      }
      // short_text i capture no compten en la nota automàtica
    });

    var scoreOver10 = 0;
    if (maxScore > 0) {
      scoreOver10 = (rawScore / maxScore) * 10;
    }
    scoreOver10 = Math.round(scoreOver10 * 100) / 100;

    return {
      rawScore: rawScore,
      maxScore: maxScore,
      scoreOver10: scoreOver10
    };
  }

  // ---------- Helpers ----------

  async function fetchJson(path) {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Error en carregar ' + path + ': ' + res.status);
    }
    return res.json();
  }

  function showMessage(box, html, level) {
    if (!box) return;
    const cls = 'message-' + (level || 'info');
    box.className = cls;
    box.innerHTML = html;
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // YYYYMMDD-HHMM
  function formatTimestampForFilename(date) {
    function pad2(n) {
      return n < 10 ? '0' + n : String(n);
    }
    const year = date.getFullYear();
    const month = pad2(date.getMonth() + 1);
    const day = pad2(date.getDate());
    const hour = pad2(date.getHours());
    const min = pad2(date.getMinutes());
    return '' + year + month + day + '-' + hour + min;
  }

  // "Júlia Pons (SMX1-A)" → "ponsjulia"
  function slugifyStudentLabelToCognomNom(label) {
    if (!label) return 'sensealumne';

    const noParen = label.split('(')[0].trim();
    const parts = noParen.split(/\s+/).filter(Boolean);

    let cognomNom;
    if (parts.length >= 2) {
      const nom = parts[0];
      const cognom = parts[parts.length - 1];
      cognomNom = cognom + nom;
    } else {
      cognomNom = parts[0] || 'sensealumne';
    }

    cognomNom = cognomNom.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    cognomNom = cognomNom.replace(/[^a-zA-Z0-9]/g, '');

    return cognomNom.toLowerCase();
  }

  function computeIntegrity(formDef, studentId, answers) {
    var base =
      (formDef.id || '') +
      '|' +
      (formDef.cycle || '') +
      '|' +
      (studentId || '') +
      '|' +
      JSON.stringify(answers || {}) +
      '|_qpardo_2025_v1_';

    return simpleHash(base);
  }

  // Hash senzill per detectar canvis manuals
  function simpleHash(str) {
    var hash = 0;
    if (!str) return '0';
    for (var i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash.toString(16);
  }
})();
