const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
module.exports = app;
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDbObjToResponseObj = (dbObj) => {
  return {
    playerId: dbObj.player_id,
    playerName: dbObj.player_name,
    jerseyNumber: dbObj.jersey_number,
    role: dbObj.role,
  };
};

//API 1

app.get("/players/", async (request, response) => {
  const listOfPlayers = `SELECT *
                       FROM cricket_team`;
  const players = await db.all(listOfPlayers);

  response.send(
    players.map((eachPlayer) => convertDbObjToResponseObj(eachPlayer))
  );
});

//API 2

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const newPlayerQuery = `INSERT INTO cricket_team(player_name,jersey_number,role)
                       VALUES (${playerName},${jerseyNumber},${role});`;
  const newPlayer = await db.run(newPlayerQuery);

  response.send("Player Added to Team");
});

//API 3

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `SELECT *
                        FROM cricket_team
                        WHERE player_id = ${playerId};`;
  const playerDetails = await db.get(getPlayer);
  response.send({
    playerId: playerDetails.player_id,
    playerName: playerDetails.player_name,
    jerseyNumber: playerDetails.jersey_number,
    role: playerDetails.role,
  });
});

//API 4

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;

  const updatePlayerQuery = `UPDATE cricket_team
                                SET player_name = ${playerName},
                                jersey_number = ${jerseyNumber},
                                role = ${role}
                                WHERE player_id = ${playerId}
                                `;
  const updatedPlayer = await db.run(updatePlayerQuery);

  response.send("Player Details Updated");
});

//API 5

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `DELETE FROM cricket_team
                                WHERE player_id = ${playerId};`;
  const deletedPlayer = await db.run(deletePlayerQuery);

  response.send("Player Removed");
});
