const views = document.querySelectorAll('.view');
const navButtons = document.querySelectorAll('.nav-btn');
const profileStatus = document.getElementById('profileStatus');
const onboardingForm = document.getElementById('onboardingForm');
const generatorForm = document.getElementById('generatorForm');
const outputText = document.getElementById('outputText');
const dashboardSummary = document.getElementById('dashboardSummary');
const libraryList = document.getElementById('libraryList');
const profileForm = document.getElementById('profileForm');
const regenerateButton = document.getElementById('regenerate');
const editOutputButton = document.getElementById('editOutput');
const saveOutputButton = document.getElementById('saveOutput');
const copyOutputButton = document.getElementById('copyOutput');
const exportOutputButton = document.getElementById('exportOutput');
const addProductButton = document.getElementById('addProduct');
const productsContainer = document.getElementById('products');

const PROFILE_KEY = 'businessProfile';
const LIBRARY_KEY = 'contentLibrary';

let latestGeneration = null;

const defaultProduct = () => ({
  name: '',
  price: '',
  benefit: '',
  audience: '',
});

const loadProfile = () => {
  const stored = localStorage.getItem(PROFILE_KEY);
  return stored ? JSON.parse(stored) : null;
};

const saveProfile = (profile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  updateStatus();
  renderDashboard();
  renderProfileForm();
};

const loadLibrary = () => {
  const stored = localStorage.getItem(LIBRARY_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveLibrary = (items) => {
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(items));
  renderLibrary();
};

const updateStatus = () => {
  const profile = loadProfile();
  profileStatus.textContent = profile
    ? `Profile: ${profile.businessName}`
    : 'Profile: Not completed';
};

const showView = (viewId) => {
  views.forEach((view) => {
    view.classList.toggle('hidden', view.id !== viewId);
  });
};

const makeProductCard = (product, index) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'product-card';
  wrapper.innerHTML = `
    <div class="form-grid">
      <div>
        <label>Product name</label>
        <input type="text" name="productName-${index}" value="${product.name}" required />
      </div>
      <div>
        <label>Price</label>
        <input type="text" name="productPrice-${index}" value="${product.price}" required />
      </div>
      <div>
        <label>Main benefit</label>
        <input type="text" name="productBenefit-${index}" value="${product.benefit}" required />
      </div>
      <div>
        <label>Who it is for</label>
        <input type="text" name="productAudience-${index}" value="${product.audience}" required />
      </div>
    </div>
    <button type="button" class="secondary" data-remove="${index}">Remove</button>
  `;

  wrapper.querySelector('[data-remove]')?.addEventListener('click', () => {
    removeProduct(index);
  });

  return wrapper;
};

const renderProducts = (products) => {
  productsContainer.innerHTML = '';
  products.forEach((product, index) => {
    productsContainer.appendChild(makeProductCard(product, index));
  });
};

let onboardingProducts = [defaultProduct()];

const removeProduct = (index) => {
  onboardingProducts = onboardingProducts.filter((_, i) => i !== index);
  if (onboardingProducts.length === 0) {
    onboardingProducts = [defaultProduct()];
  }
  renderProducts(onboardingProducts);
};

addProductButton.addEventListener('click', () => {
  onboardingProducts = [...onboardingProducts, defaultProduct()];
  renderProducts(onboardingProducts);
});

const handleOnboardingSubmit = (event) => {
  event.preventDefault();
  const formData = new FormData(onboardingForm);
  const products = onboardingProducts.map((_, index) => ({
    name: formData.get(`productName-${index}`) || '',
    price: formData.get(`productPrice-${index}`) || '',
    benefit: formData.get(`productBenefit-${index}`) || '',
    audience: formData.get(`productAudience-${index}`) || '',
  }));

  const profile = {
    ownerName: formData.get('ownerName'),
    businessEmail: formData.get('businessEmail'),
    businessName: formData.get('businessName'),
    businessContact: formData.get('businessContact'),
    businessLocation: formData.get('businessLocation'),
    industry: formData.get('industry'),
    toneExample1: formData.get('toneExample1'),
    toneExample2: formData.get('toneExample2'),
    wordsToUse: formData.get('wordsToUse'),
    wordsToAvoid: formData.get('wordsToAvoid'),
    products,
    targetCustomer: formData.get('targetCustomer'),
    customerProblem: formData.get('customerProblem'),
    customerOutcome: formData.get('customerOutcome'),
    contentGoal: formData.get('contentGoal'),
    callToAction: formData.get('callToAction'),
    platform: formData.get('platform'),
  };

  saveProfile(profile);
  showView('dashboard');
};

const renderDashboard = () => {
  const profile = loadProfile();
  if (!dashboardSummary) return;

  if (!profile) {
    dashboardSummary.innerHTML = '<p class="muted">Complete onboarding to unlock insights.</p>';
    return;
  }

  dashboardSummary.innerHTML = `
    <div class="summary-card">
      <h4>Business</h4>
      <p>${profile.businessName}</p>
      <p class="muted">${profile.industry}</p>
    </div>
    <div class="summary-card">
      <h4>Platform</h4>
      <p>${profile.platform}</p>
      <p class="muted">Primary channel</p>
    </div>
    <div class="summary-card">
      <h4>Content Goal</h4>
      <p>${profile.contentGoal}</p>
      <p class="muted">CTA: ${profile.callToAction}</p>
    </div>
    <div class="summary-card">
      <h4>Audience</h4>
      <p>${profile.targetCustomer}</p>
      <p class="muted">Problem: ${profile.customerProblem}</p>
    </div>
  `;
};

const generateContent = ({ contentType, topic, length }) => {
  const profile = loadProfile();
  if (!profile) {
    return 'Complete onboarding before generating content.';
  }

  const productHighlights = profile.products
    .map((product) => `${product.name} (${product.price}) - ${product.benefit}`)
    .join('\n');

  const toneNotes = [profile.toneExample1, profile.toneExample2]
    .filter(Boolean)
    .join('\n');

  return `Platform: ${profile.platform}
Content type: ${contentType}
Topic focus: ${topic}
Length: ${length}

Brand DNA summary:
- Business: ${profile.businessName} (${profile.industry})
- Audience: ${profile.targetCustomer}
- Main problem: ${profile.customerProblem}
- Desired outcome: ${profile.customerOutcome}
- Content goal: ${profile.contentGoal}
- CTA: ${profile.callToAction}
- Preferred words: ${profile.wordsToUse || 'N/A'}
- Avoid: ${profile.wordsToAvoid || 'N/A'}

Products/services:
${productHighlights}

Brand voice examples:
${toneNotes}

Generated content:
${profile.businessName} can help ${profile.targetCustomer} achieve ${profile.customerOutcome} without the ${profile.customerProblem}.
Here is why ${profile.products[0]?.name || 'our offer'} stands out: ${profile.products[0]?.benefit || 'clear business impact'}.

${topic} is the perfect moment to show what that looks like. ${profile.wordsToUse ? `Expect a ${profile.wordsToUse} feel` : ''}.

Call to action: ${profile.callToAction} to get started.`.trim();
};

const handleGeneratorSubmit = (event) => {
  event.preventDefault();
  const formData = new FormData(generatorForm);
  latestGeneration = {
    contentType: formData.get('contentType'),
    topic: formData.get('topic'),
    length: formData.get('length'),
  };
  outputText.value = generateContent(latestGeneration);
  outputText.setAttribute('readonly', 'readonly');
  showView('output');
};

const renderLibrary = () => {
  const items = loadLibrary();
  if (items.length === 0) {
    libraryList.innerHTML = '<p class="muted">No saved content yet.</p>';
    return;
  }

  libraryList.innerHTML = items
    .map(
      (item) => `
      <div class="library-item">
        <h4>${item.contentType} • ${item.platform}</h4>
        <p class="muted">${item.topic}</p>
        <pre>${item.output}</pre>
      </div>
    `
    )
    .join('');
};

const renderProfileForm = () => {
  const profile = loadProfile();
  if (!profile) {
    profileForm.innerHTML = '<p class="muted">Complete onboarding to edit your profile.</p>';
    return;
  }

  profileForm.innerHTML = `
    <div class="form-grid">
      <div>
        <label>Business Name</label>
        <input type="text" name="businessName" value="${profile.businessName}" required />
      </div>
      <div>
        <label>Business Email</label>
        <input type="email" name="businessEmail" value="${profile.businessEmail}" required />
      </div>
      <div>
        <label>Industry</label>
        <input type="text" name="industry" value="${profile.industry}" required />
      </div>
      <div>
        <label>Platform</label>
        <input type="text" name="platform" value="${profile.platform}" required />
      </div>
    </div>
    <label>Target customer</label>
    <input type="text" name="targetCustomer" value="${profile.targetCustomer}" required />
    <label>Customer problem</label>
    <input type="text" name="customerProblem" value="${profile.customerProblem}" required />
    <label>Customer outcome</label>
    <input type="text" name="customerOutcome" value="${profile.customerOutcome}" required />
    <label>Call to action</label>
    <input type="text" name="callToAction" value="${profile.callToAction}" required />
    <label>Words to use</label>
    <input type="text" name="wordsToUse" value="${profile.wordsToUse || ''}" />
    <label>Words to avoid</label>
    <input type="text" name="wordsToAvoid" value="${profile.wordsToAvoid || ''}" />
    <label>Tone example #1</label>
    <textarea name="toneExample1" required>${profile.toneExample1}</textarea>
    <label>Tone example #2</label>
    <textarea name="toneExample2">${profile.toneExample2 || ''}</textarea>
    <div class="form-actions">
      <button type="submit">Save updates</button>
    </div>
  `;

  profileForm.addEventListener(
    'submit',
    (event) => {
      event.preventDefault();
      const formData = new FormData(profileForm);
      const updated = {
        ...profile,
        businessName: formData.get('businessName'),
        businessEmail: formData.get('businessEmail'),
        industry: formData.get('industry'),
        platform: formData.get('platform'),
        targetCustomer: formData.get('targetCustomer'),
        customerProblem: formData.get('customerProblem'),
        customerOutcome: formData.get('customerOutcome'),
        callToAction: formData.get('callToAction'),
        wordsToUse: formData.get('wordsToUse'),
        wordsToAvoid: formData.get('wordsToAvoid'),
        toneExample1: formData.get('toneExample1'),
        toneExample2: formData.get('toneExample2'),
      };
      saveProfile(updated);
    },
    { once: true }
  );
};

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    showView(button.dataset.view);
  });
});

document.querySelectorAll('[data-view]').forEach((button) => {
  button.addEventListener('click', () => {
    showView(button.dataset.view);
  });
});

onboardingForm.addEventListener('submit', handleOnboardingSubmit);
generatorForm.addEventListener('submit', handleGeneratorSubmit);

regenerateButton.addEventListener('click', () => {
  if (latestGeneration) {
    outputText.value = generateContent(latestGeneration);
  }
});

editOutputButton.addEventListener('click', () => {
  if (outputText.hasAttribute('readonly')) {
    outputText.removeAttribute('readonly');
    editOutputButton.textContent = 'Lock output';
  } else {
    outputText.setAttribute('readonly', 'readonly');
    editOutputButton.textContent = 'Edit manually';
  }
});

saveOutputButton.addEventListener('click', () => {
  if (!latestGeneration) return;
  const profile = loadProfile();
  const items = loadLibrary();
  items.unshift({
    id: Date.now(),
    output: outputText.value,
    ...latestGeneration,
    platform: profile?.platform || 'Unspecified',
  });
  saveLibrary(items);
  showView('library');
});

copyOutputButton.addEventListener('click', async () => {
  if (!outputText.value) return;
  await navigator.clipboard.writeText(outputText.value);
  copyOutputButton.textContent = 'Copied!';
  setTimeout(() => {
    copyOutputButton.textContent = 'Copy';
  }, 1500);
});

exportOutputButton.addEventListener('click', () => {
  if (!outputText.value) return;
  const blob = new Blob([outputText.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'generated-content.txt';
  link.click();
  URL.revokeObjectURL(url);
});

const initialize = () => {
  renderProducts(onboardingProducts);
  updateStatus();
  renderDashboard();
  renderLibrary();
  renderProfileForm();
};

initialize();
