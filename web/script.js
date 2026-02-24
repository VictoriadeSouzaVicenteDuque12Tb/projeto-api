const API_URL = 'http://localhost:3333';

// Load and apply saved theme
const html = document.documentElement;
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);

// Theme toggle
document.getElementById('themeToggle').addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    document.getElementById('themeToggle').textContent = newTheme === 'light' ? '🌙' : '☀️';
});

// Load products on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupFormHandler();
});

// Load and display products
async function loadProducts() {
    const productsList = document.getElementById('produtosList');
    if (!productsList) return;

    try {
        const response = await fetch(`${API_URL}/produtos`);
        const data = await response.json();
        const products = data.produtos || [];

        if (products.length === 0) {
            productsList.innerHTML = '<p class="empty">Nenhum produto cadastrado ainda</p>';
            return;
        }

        productsList.innerHTML = products.map(p => `
            <div class="produto-card">
                <div class="produto-header">
                    <span class="categoria-badge">${p.category || 'Sem categoria'}</span>
                </div>
                <div class="produto-body">
                    <h3>${p.name || 'Sem nome'}</h3>
                    <p class="descricao">${(p.description || '').substring(0, 80)}...</p>
                    <p class="preco">R$ ${parseFloat(p.price || 0).toFixed(2).replace('.', ',')}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        productsList.innerHTML = '<p class="error">Erro ao carregar produtos</p>';
    }
}

// Setup form submission
function setupFormHandler() {
    const form = document.getElementById('produtoForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nome = document.getElementById('nome').value;
        const preco = document.getElementById('preco').value;
        const categoria = document.getElementById('categoria').value;
        const descricao = document.getElementById('descricao').value;

        try {
            const response = await fetch(`${API_URL}/produtos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: nome,
                    price: parseFloat(preco),
                    category: categoria,
                    description: descricao
                })
            });

            const result = await response.json();

            if (result.sucesso) {
                showSuccess(`Produto "${nome}" cadastrado com sucesso!`);
                form.reset();
                loadProducts();
            } else {
                showError(result.mensagem || 'Erro ao cadastrar');
            }
        } catch (error) {
            console.error('Erro:', error);
            showError('Erro ao conectar com o servidor');
        }
    });
}

// Show success message
function showSuccess(message) {
    const alert = document.getElementById('successAlert');
    const text = document.getElementById('successText');
    if (alert) {
        text.textContent = message;
        alert.style.display = 'block';
        setTimeout(() => { alert.style.display = 'none'; }, 5000);
    }
}

// Show error message
function showError(message) {
    const alert = document.getElementById('errorAlert');
    const text = document.getElementById('errorText');
    if (alert) {
        text.textContent = message;
        alert.style.display = 'block';
        setTimeout(() => { alert.style.display = 'none'; }, 5000);
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
