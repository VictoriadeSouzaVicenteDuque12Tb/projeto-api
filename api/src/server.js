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
  const { nome, preco, categoria, descricao } = req.body

  // Validação dos dados
  if (!nome || !preco || !categoria || !descricao) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Nome, preço, categoria e descrição são obrigatórios'
    })
  }

  // Executar query de inserção
  const connection = await pool.getConnection()
  if (connection) {
    const result = await connection.execute(
      'INSERT INTO produtos (nome, preco, categoria, descricao) VALUES (?, ?, ?, ?)',
      [nome, preco, categoria, descricao]
    )
    connection.release()

    if (result) {
      return res.status(201).json({
        sucesso: true,
        mensagem: 'Produto cadastrado com sucesso!',
        produto: {
          nome,
          preco,
          categoria,
          descricao
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
      'SELECT nome, preco, categoria, descricao FROM produtos'
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