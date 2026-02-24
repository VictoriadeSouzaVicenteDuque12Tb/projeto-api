const API_URL = 'http://localhost:3333';

// Theme Toggle
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Load theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Load products if on produtos page
    if (document.getElementById('productsGrid')) {
        loadProducts();
    }
});

// Load Products
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/produtos`);
        const data = await response.json();
        
        displayProducts(data.produtos || []);
        populateCategories(data.produtos || []);
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        document.getElementById('productsGrid').innerHTML = 
            '<p style="grid-column: 1/-1; color: red;">Erro ao carregar produtos</p>';
    }
}

// Display Products
function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (products.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    grid.innerHTML = products.map(product => `
        <div class="produto-card">
            <div class="produto-header">
                <span class="produto-categoria">${product.category || 'Sem categoria'}</span>
                <span class="produto-nome">${product.name || 'Sem nome'}</span>
            </div>
            <div class="produto-info">
                <p class="produto-descricao">${(product.description || 'Sem descrição').substring(0, 100)}...</p>
                <p class="produto-preco">R$ ${parseFloat(product.price || 0).toFixed(2).replace('.', ',')}</p>
            </div>
        </div>
    `).join('');
}

// Populate Category Filter
function populateCategories(products) {
    const select = document.getElementById('categoryFilter');
    if (!select) return;
    
    const categories = [...new Set(products.map(p => p.category))].filter(Boolean);
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
}

// Filter by Category
async function filterByCategory() {
    const category = document.getElementById('categoryFilter').value;
    
    try {
        const response = await fetch(`${API_URL}/produtos`);
        const data = await response.json();
        
        let filtered = data.produtos || [];
        if (category) {
            filtered = filtered.filter(p => p.category === category);
        }
        
        displayProducts(filtered);
    } catch (error) {
        console.error('Erro ao filtrar:', error);
    }
}

// Handle Form Submit
async function handleSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('name')?.value;
    const price = document.getElementById('price')?.value;
    const category = document.getElementById('category')?.value;
    const description = document.getElementById('description')?.value;
    
    if (!name || !price || !category || !description) {
        showError('Todos os campos são obrigatórios');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/produtos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                price: parseFloat(price),
                category,
                description
            })
        });
        
        const data = await response.json();
        
        if (data.sucesso) {
            showSuccess(`Produto "${name}" cadastrado com sucesso!`);
            document.getElementById('productForm').reset();
            
            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = 'produtos.html';
            }, 2000);
        } else {
            showError(data.mensagem || 'Erro ao cadastrar produto');
        }
    } catch (error) {
        console.error('Erro:', error);
        showError('Erro ao conectar com o servidor');
    }
}

// Show Success Message
function showSuccess(message) {
    const alert = document.getElementById('successAlert');
    if (alert) {
        document.getElementById('successMessage').textContent = message;
        alert.style.display = 'block';
    }
}

// Show Error Message
function showError(message) {
    const alert = document.getElementById('errorAlert');
    if (alert) {
        document.getElementById('errorMessage').textContent = message;
        alert.style.display = 'block';
    }
}
