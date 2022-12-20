import express from 'express'

const app = express()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/test', (req, res) => {
  res.send('Hello World!')
})

app.listen(3004, () => {
  console.log('Example app listening on port 3004!!!')
})

export default app
