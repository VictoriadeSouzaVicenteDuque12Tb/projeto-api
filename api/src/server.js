import express from 'express'
import mysql from 'mysql2/promise'

const app = express()
const port = 3333

// Middleware
app.use(express.json())

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

// Rota inicial
app.get('/', (req, res) => {
  res.json({
    message: 'Bem-vindo à API de Produtos',
    status: 'Server running on port 3333'
  })
})

// Rota para cadastrar produto
app.post('/produtos', async (req, res) => {
  try {
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
    await connection.execute(
      'INSERT INTO produtos (nome, preco, categoria, descricao) VALUES (?, ?, ?, ?)',
      [nome, preco, categoria, descricao]
    )
    connection.release()

    res.status(201).json({
      sucesso: true,
      mensagem: 'Produto cadastrado com sucesso!',
      produto: {
        nome,
        preco,
        categoria,
        descricao
      }
    })
  } catch (error) {
    console.error('Erro ao cadastrar produto:', error)
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao cadastrar produto',
      erro: error.message
    })
  }
})

// Rota para exibir todos os produtos
app.get('/produtos', async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const [produtos] = await connection.execute(
      'SELECT nome, preco, categoria, descricao FROM produtos'
    )
    connection.release()

    if (produtos.length === 0) {
      return res.json({
        sucesso: true,
        mensagem: 'Nenhum produto cadastrado',
        produtos: []
      })
    }

    res.json({
      sucesso: true,
      total: produtos.length,
      produtos: produtos
    })
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar produtos',
      erro: error.message
    })
  }
})

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`)
})