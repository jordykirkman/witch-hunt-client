import io from 'socket.io-client';
const defaultState = {
  ws:                 io(),
  botCount:           0,
  username:           '',
  user:               {},
  chat:               [],
  lobbyId:            '',
  joinLobbyId:        '',
  instructions:       null,
  playerNotification: null,
  showNotification:   false,
  notificationClass:  '',
  players:            [],
  create:             true,
  started:            false,
  winner:             null,
  time:               'night',
  error:              null,
  onTrial:            null,
  mistSettings:       {
    canvasWidth:      600
  }
}

const trialState = {
  ws:                 io(),
  mistSettings:       {
    canvasWidth:      600
  },
  user: {"id":"zPGaWdfEO1vI2O_aAAAB","isCreator":false,"isDead":false,"role":"villager","skip":false,"username":"jiji","voteFor":null,"trialVote":null,"killVote":[],"ghostVote":[]},
  "players": [
    {"id":"zPGaWdfEO1vI2O_aAAAB","isCreator":false,"isDead":false,"role":"villager","skip":false,"username":"jiji","voteFor":null,"trialVote":"R3g1uZKu8_GrBh8cAAAC","killVote":[],"ghostVote":[]},
    {"id":"R3g1uZKu8_GrBh8cAAAC","isCreator":false,"isDead":false,"role":"witch","skip":false,"username":"pripribbkitty","voteFor":null,"trialVote":null,"killVote":[],"ghostVote":[]},
    {"id":"ei2W9aNW9FFSGZANAAAD","isCreator":false,"isDead":false,"role":"prophet","skip":false,"username":"pokyCuddleDumplin IV","voteFor":null,"trialVote":null,"killVote":[],"ghostVote":[]},
    {"id":"R_2VVCGzEHWX0IDaAAAE","isCreator":true,"isDead":false,"role":"villager","skip":false,"username":"jordy","voteFor":null,"trialVote":"R3g1uZKu8_GrBh8cAAAC","killVote":[],"ghostVote":[]}
  ],
  "prophetText":"Select someone to reveal thier secrets.",
  "witchText":"Select who shouldn't live any longer.",
  "dayText":"Select someone who is guilty or choose to skip today.",
  "lobbyId":"restless-bog-14",
  "started":true,
  "time":"trial",
  "winner":null,
  "onTrial":{"id":"R3g1uZKu8_GrBh8cAAAC","isCreator":false,"isDead":false,"role":"witch","skip":false,"username":"prini","voteFor":null,"trialVote":null,"killVote":[],"ghostVote":[]},
  "chat": [
    {"message": "uuuuh", "from": "R3g1uZKu8_GrBh8cAAAC"},
    {"message": "I'm villager for real", "from": "R3g1uZKu8_GrBh8cAAAC"},
    {"message": "It's poky!!", "from": "R3g1uZKu8_GrBh8cAAAC"},
    {"message": "She was missing last night", "from": "R3g1uZKu8_GrBh8cAAAC"},
    {"message": "I swear", "from": "R3g1uZKu8_GrBh8cAAAC"},
  ],
}

module.exports = { trialState, defaultState};