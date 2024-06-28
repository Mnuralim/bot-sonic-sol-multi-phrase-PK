require('dotenv').config()

const fetchData = async (stage, authToken) => {
  try {
    const response = await fetch('https://odyssey-api.sonic.game/user/transactions/rewards/claim', {
      method: 'POST',
      body: JSON.stringify({
        stage,
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    })

    const data = await response.json()
    console.log(data)
  } catch (error) {
    console.log(error)
  }
}

;(async () => {
  const stages = [1, 2, 3]
  const authTokens = JSON.parse(process.env.AUTH_TOKENS)

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i]
    const authToken = authTokens[i]
    await fetchData(stage, authToken)
  }
})()
