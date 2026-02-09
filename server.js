import express from "express"

const app = express()
const port = 3333

app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    mensage: "Olá Marcio, tô ultilizando ia"
  })
})

app.listen(port, () => {
  console.log(`Server running on port http://localhost${port}`)
})