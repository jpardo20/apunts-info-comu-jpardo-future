(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', initBuilder);

  function initBuilder() {
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    const questionsList = document.getElementById('questionsList');
    const refreshJsonBtn = document.getElementById('refreshJsonBtn');
    const downloadJsonBtn = document.getElementById('downloadJsonBtn');
    const jsonPreview = document.getElementById('jsonPreview');

    if (!addQuestionBtn || !questionsList || !jsonPreview) return;

    // Afegim una pregunta inicial perquè el profe vegi l'estructura
    addQuestionCard(questionsList);

    addQuestionBtn.addEventListener('click', function () {
      addQuestionCard(questionsList);
      updatePreview();
    });

    refreshJsonBtn.addEventListener('click', function () {
      updatePreview();
    });

    downloadJsonBtn.addEventListener('click', function () {
      const def = buildFormDefinition();
      const id = def.id || 'formulari';
      const filename = id + '.json';

      const blob = new Blob([JSON.stringify(def, null, 2)], {
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
    });

    // Actualitzem previsualització quan es canvia res
    document.querySelector('.builder-main').addEventListener('input', function () {
      updatePreview();
    });
    document.querySelector('.builder-main').addEventListener('change', function () {
      updatePreview();
    });

    // Primera previsualització
    updatePreview();

    function updatePreview() {
      const def = buildFormDefinition();
      jsonPreview.value = JSON.stringify(def, null, 2);
    }
  }

  // ------------------------- Construcció UI preguntes -------------------------

  function addQuestionCard(container) {
    const index = container.querySelectorAll('.builder-question-card').length + 1;

    const card = document.createElement('div');
    card.className = 'builder-question-card';
    card.dataset.index = String(index);

    const header = document.createElement('div');
    header.className = 'builder-question-header';

    const title = document.createElement('div');
    title.className = 'builder-question-title';
    title.textContent = 'Pregunta ' + index + ' (resposta curta)';

    const actions = document.createElement('div');
    actions.className = 'builder-question-actions';

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Elimina';

    deleteBtn.addEventListener('click', function () {
      card.remove();
      renumberQuestions(container);
    });

    actions.appendChild(deleteBtn);
    header.appendChild(title);
    header.appendChild(actions);

    const body = document.createElement('div');
    body.className = 'builder-question-body';

    // Enunciat
    const fieldLabel = createField(
      'Enunciat de la pregunta',
      'textarea',
      'Ex: Explica amb les teves paraules què és la tensió elèctrica.'
    );
    fieldLabel.querySelector('textarea').rows = 2;

    // Text d'ajuda
    const fieldHelp = createField(
      'Text d\'ajuda (opcional)',
      'input',
      'Ex: Resposta curta, entre 1 i 3 frases.'
    );

    // Max length
    const fieldMaxLen = createField(
      'Màxim de caràcters (opcional)',
      'input',
      'Ex: 300'
    );
    fieldMaxLen.querySelector('input').type = 'number';

    // Pes (weight)
    const fieldWeight = createField(
      'Pes a la nota automàtica',
      'input',
      'Ex: 1 (per defecte)'
    );
    const weightInput = fieldWeight.querySelector('input');
    weightInput.type = 'number';
    weightInput.value = '1';
    weightInput.step = '0.5';

    // Required
    const requiredLine = document.createElement('div');
    requiredLine.className = 'builder-checkbox-line';
    const requiredCheckbox = document.createElement('input');
    requiredCheckbox.type = 'checkbox';
    requiredCheckbox.checked = true;
    const requiredLabel = document.createElement('label');
    requiredLabel.textContent = 'Pregunta obligatòria';
    requiredLine.appendChild(requiredCheckbox);
    requiredLine.appendChild(requiredLabel);

    body.appendChild(fieldLabel);
    body.appendChild(fieldHelp);
    body.appendChild(fieldMaxLen);
    body.appendChild(fieldWeight);
    body.appendChild(requiredLine);

    card.appendChild(header);
    card.appendChild(body);

    container.appendChild(card);
  }

  function renumberQuestions(container) {
    const cards = container.querySelectorAll('.builder-question-card');
    cards.forEach(function (card, idx) {
      card.dataset.index = String(idx + 1);
      const title = card.querySelector('.builder-question-title');
      if (title) {
        title.textContent = 'Pregunta ' + (idx + 1) + ' (resposta curta)';
      }
    });
  }

  function createField(labelText, inputType, placeholder) {
    const wrapper = document.createElement('div');
    wrapper.className = 'builder-field';

    const label = document.createElement('label');
    label.textContent = labelText;

    let input;
    if (inputType === 'textarea') {
      input = document.createElement('textarea');
    } else {
      input = document.createElement('input');
    }
    input.placeholder = placeholder || '';

    wrapper.appendChild(label);
    wrapper.appendChild(input);

    return wrapper;
  }

  // ------------------------- Construcció del JSON ----------------------------

  function buildFormDefinition() {
    const title = getValue('formTitle');
    let formId = getValue('formId');
    const cycle = getValue('formCycle');
    const moduleCode = getValue('formModule');
    const moduleName = getValue('formModuleName');
    const description = getValue('formDescription');

    if (!formId && title) {
      formId = slugify(title);
    }

    const questions = [];
    const cards = document.querySelectorAll('.builder-question-card');
    cards.forEach(function (card, idx) {
      const body = card.querySelector('.builder-question-body');
      if (!body) return;

      const textareas = body.querySelectorAll('textarea');
      const inputs = body.querySelectorAll('input');

      const label = textareas[0] ? textareas[0].value.trim() : '';
      const helpText = inputs[0] ? inputs[0].value.trim() : '';
      const maxLenRaw = inputs[1] ? inputs[1].value.trim() : '';
      const weightRaw = inputs[2] ? inputs[2].value.trim() : '';
      const required = inputs[3] ? inputs[3].checked : true;

      const q = {
        id: 'q' + (idx + 1),
        type: 'short_text',
        label: label || ('Pregunta ' + (idx + 1)),
        required: !!required
      };

      if (helpText) {
        q.helpText = helpText;
      }
      if (maxLenRaw) {
        const n = parseInt(maxLenRaw, 10);
        if (!isNaN(n) && n > 0) {
          q.max_length = n;
        }
      }
      if (weightRaw) {
        const w = parseFloat(weightRaw);
        if (!isNaN(w)) {
          q.weight = w;
        }
      } else {
        q.weight = 1;
      }

      questions.push(q);
    });

    const def = {
      id: formId || '',
      title: title || '',
      description: description || '',
      cycle: cycle || '',
      module: moduleCode || '',
      moduleName: moduleName || '',
      questions: questions
    };

    return def;
  }

  function getValue(id) {
    const el = document.getElementById(id);
    if (!el) return '';
    return (el.value || '').toString().trim();
  }

  function slugify(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
})();