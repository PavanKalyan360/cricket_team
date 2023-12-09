const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

let app = express()
app.use(express.json())

const dbpath = path.join(__dirname, 'cricketTeam.db')
let db = null

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDBandServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

// API 1: Get all players
app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
 SELECT
 *
 FROM
 cricket_team;`
  const playersArray = await database.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

// API 2: Add a new player
app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails

  const addPlayerDetails = `
      INSERT INTO
        cricket_team (player_name, jersey_number, role)
      VALUES
        ('${playerName}', ${jerseyNumber}, '${role}');`

  await db.run(addPlayerDetails)
  response.send('Player Added to Team')
})

// API 3: Get player by ID
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerDetails = `
    SELECT
        *
    FROM
        cricket_team
    WHERE
        player_id = ${playerId};`

  const player = await db.get(getPlayerDetails)
  response.send(convertDbObjectToResponseObject(player))
})

// API 4: Update player details by ID
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails

  const updatePlayerDetails = `
      UPDATE
        cricket_team
      SET
        player_name = '${playerName}', 
        jersey_number = ${jerseyNumber}, 
        role = '${role}'
      WHERE
        player_id = ${playerId};`

  await db.run(updatePlayerDetails)
  response.send('Player Details Updated')
})

// API 5: Delete player by ID
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayer = `
    DELETE FROM
        cricket_team
    WHERE
        player_id = ${playerId};`

  await db.run(deletePlayer)
  response.send('Player Removed')
})

module.exports = app
