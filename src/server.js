import express from 'express'
import mysql from 'mysql2/promise'

const app = express()
const port = 3333

app.use(express.json())

// Habilitar CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

// Configuração do Pool MySQL
const pool = mysql.createPool({
  host: 'benserverplex.ddns.net',
  user: 'alunos',
  password: 'senhaAlunos',
  database: 'web_03mc',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Rota para cadastrar produto
app.post('/produtos', async (req, res) => {
  // Accept either English or Portuguese field names
  const name = req.body.name || req.body.nome
  const price = req.body.price || req.body.preco
  const category = req.body.category || req.body.categoria
  const description = req.body.description || req.body.descricao

  // Validação dos dados
  if (!name || !price || !category || !description) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'name/price/category/description são obrigatórios'
    })
  }

  // Executar query de inserção na tabela products_victoria (preenche colunas em pt/br e en)
  const connection = await pool.getConnection()
  if (connection) {
    const result = await connection.execute(
      'INSERT INTO products_victoria (nome, preco, categoria, descricao, `name`, price, `category`, `description`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, price, category, description, name, price, category, description]
    )
    connection.release()

    if (result) {
      return res.status(201).json({
        sucesso: true,
        mensagem: 'Produto cadastrado com sucesso!',
        produto: {
          id: result[0].insertId,
          name,
          price,
          category,
          description
        }
      })
    }
  }

  res.status(500).json({
    sucesso: false,
    mensagem: 'Erro ao cadastrar produto'
  })
})

// Rota para exibir todos os produtos
app.get('/produtos', async (req, res) => {
  const connection = await pool.getConnection()
  if (connection) {
    const [produtos] = await connection.execute(
      'SELECT id, `name` AS name, price, `category` AS category, `description` AS description FROM products_victoria'
    )
    connection.release()

    if (produtos && produtos.length === 0) {
      return res.json({
        sucesso: true,
        mensagem: 'Nenhum produto cadastrado',
        produtos: []
      })
    }

    if (produtos) {
      return res.json({
        sucesso: true,
        total: produtos.length,
        produtos: produtos
      })
    }
  }

  res.status(500).json({
    sucesso: false,
    mensagem: 'Erro ao buscar produtos'
  })
})

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`)
})