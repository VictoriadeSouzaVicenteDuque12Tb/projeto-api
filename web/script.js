const API_URL = 'http://localhost:3333';
let allProducts = [];

// Carregar tema salvo
const html = document.documentElement;
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

// Alternar tema
document.getElementById('themeToggle').addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    document.getElementById('themeToggle').textContent = theme === 'light' ? '🌙' : '☀️';
}

// Carregar produtos
async function loadProdutos() {
    const productsGrid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');

    if (allProducts.length === 0) {
        const response = await fetch(`${API_URL}/produtos`);
        if (response.ok) {
            const data = await response.json();
            allProducts = data.produtos || [];
        } else {
            console.error('Erro ao carregar produtos');
            allProducts = [];
        }
    }

    if (allProducts.length === 0) {
        productsGrid.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        productsGrid.style.display = 'grid';
        emptyState.style.display = 'none';
        renderProdutos(allProducts);
        populateCategories();
    }
}

function renderProdutos(produtos) {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    if (produtos.length === 0) {
        document.getElementById('emptyState').style.display = 'block';
        productsGrid.style.display = 'none';
        return;
    }

    produtos.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-header">📦</div>
            <div class="product-body">
                <h3 class="product-name">${produto.nome}</h3>
                <span class="product-category">${produto.categoria}</span>
                <p class="product-description">${produto.descricao}</p>
                <p class="product-price">R$ ${parseFloat(produto.preco).toFixed(2)}</p>
                <button class="btn-add-cart">Adicionar ao Carrinho</button>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = [...new Set(allProducts.map(p => p.categoria))];
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Filtrar por categoria
document.getElementById('categoryFilter').addEventListener('change', (e) => {
    filterProducts();
});

// Buscar produtos
document.getElementById('searchInput').addEventListener('input', (e) => {
    filterProducts();
});

function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryTerm = document.getElementById('categoryFilter').value;

    const filtered = allProducts.filter(produto => {
        const matchSearch = produto.nome.toLowerCase().includes(searchTerm) || 
                          produto.descricao.toLowerCase().includes(searchTerm);
        const matchCategory = categoryTerm === '' || produto.categoria === categoryTerm;
        
        return matchSearch && matchCategory;
    });

    renderProdutos(filtered);
}

// Carregar produtos ao abrir a página
loadProdutos();

// Atualizar link ativo na navegação
document.querySelectorAll('.nav-link').forEach(link => {
    if (link.href === window.location.href) {
        link.classList.add('active');
    } else {
        link.classList.remove('active');
    }
});
