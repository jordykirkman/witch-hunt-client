import io from 'socket.io-client';
const ws = io({transports: ['websocket'], upgrade: false})
const defaultState = {
  ws:                 ws,
  botCount:           0,
  username:           '',
  user:               {},
  messages:           [],
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
  watching:           null,
  marking:            null,
  mistSettings:       {
    canvasWidth:      600
  }
}

const trialState = {
  ws:                 ws,
  mistSettings:       {
    canvasWidth:      600
  },
  user: {"id":"zPGaWdfEO1vI2O_aAAAB","isCreator":false,"isDead":false,"role":"villager","skip":false,"username":"jiji","voteFor":null,"trialVote":null,"killVote":[],"ghostVote":[]},
  "players": [
    {"id":"zPGaWdfEO1vI2O_aAAAB","isCreator":false,"isDead":false,"isMarked":true,"role":"villager","skip":false,"username":"jiji","voteFor":null,"trialVote":"R3g1uZKu8_GrBh8cAAAC","killVote":[],"ghostVote":[]},
    {"id":"R3g1uZKu8_GrBh8cAAAC","isCreator":false,"isDead":false,"isMarked":false,"role":"witch","skip":false,"username":"pripribbkitty","voteFor":null,"trialVote":null,"killVote":[],"ghostVote":[]},
    {"id":"ei2W9aNW9FFSGZANAAAD","isCreator":false,"isDead":false,"isMarked":false,"role":"prophet","skip":false,"username":"pokyCuddleDumplin IV","voteFor":null,"trialVote":null,"killVote":[],"ghostVote":[]},
    {"id":"R_2VVCGzEHWX0IDaAAAE","isCreator":true,"isDead":false,"isMarked":false,"role":"villager","skip":false,"username":"jordy","voteFor":null,"trialVote":"R3g1uZKu8_GrBh8cAAAC","killVote":[],"ghostVote":[]}
  ],
  "prophetText":"Select someone to reveal thier secrets.",
  "witchText":"Select who shouldn't live any longer.",
  "dayText":"Select someone who is guilty or choose to skip today.",
  "lobbyId":"restless-bog-14",
  "started":true,
  "time":"trial",
  "winner":null,
  "watching": null,
  "onTrial":{"id":"R3g1uZKu8_GrBh8cAAAC","isCreator":false,"isDead":false,"role":"witch","skip":false,"username":"prini","voteFor":null,"trialVote":null,"killVote":[],"ghostVote":[]},
  "messages": [
    {"message": "uuuuh", "userId": "R3g1uZKu8_GrBh8cAAAC", "username": "pripribbkitty"},
    {"message": "I'm villager for real", "userId": "R3g1uZKu8_GrBh8cAAAC", "username": "pripribbkitty"},
    {"message": "It's poky!!", "userId": "R3g1uZKu8_GrBh8cAAAC", "username": "pripribbkitty"},
    {"message": "She was missing last night", "userId": "R3g1uZKu8_GrBh8cAAAC", "username": "pripribbkitty"},
    {"message": "I swear", "userId": "R3g1uZKu8_GrBh8cAAAC", "username": "pripribbkitty"},
  ],
}

const nightState = {
  ws:                 ws,
  mistSettings:       {
    canvasWidth:      600
  },
  user: {"id":"zPGaWdfEO1vI2O_aAAAB","isCreator":false,"isDead":false,"role":"villager","skip":false,"username":"jiji","voteFor":null,"trialVote":null,"killVote":[],"ghostVote":[]},
  "players": [
    {"id":"zPGaWdfEO1vI2O_aAAAB","isCreator":false,"isDead":false,"isMarked":true,"role":"villager","skip":false,"username":"jiji","voteFor":null,"trialVote":null,"killVote":[],"ghostVote":[]},
    {"id":"R3g1uZKu8_GrBh8cAAAC","isCreator":false,"isDead":false,"isMarked":false,"role":"witch","skip":false,"username":"pripribbkitty","voteFor":null,"trialVote":null,"killVote":[],"ghostVote":[]},
    {"id":"ei2W9aNW9FFSGZANAAAD","isCreator":false,"isDead":false,"isMarked":false,"role":"prophet","skip":false,"username":"pokyCuddleDumplin IV","voteFor":null,"trialVote":null,"killVote":[],"ghostVote":[]},
    {"id":"R_2VVCGzEHWX0IDaAAAE","isCreator":true,"isDead":false,"isMarked":false,"role":"villager","skip":false,"username":"jordy","voteFor":null,"trialVote":null,"killVote":[],"ghostVote":[]}
  ],
  "prophetText":"Select someone to reveal thier secrets.",
  "witchText":"Select who shouldn't live any longer.",
  "dayText":"Select someone who is guilty or choose to skip today.",
  "lobbyId":"restless-bog-14",
  "started":true,
  "time":"night",
  "winner":null,
  "watching": "R3g1uZKu8_GrBh8cAAAC",
  "onTrial": null,
  "messages": [
    {"message": "uuuuh", "userId": "R3g1uZKu8_GrBh8cAAAC", "username": "pripribbkitty"},
    {"message": "I'm villager for real", "userId": "R3g1uZKu8_GrBh8cAAAC", "username": "pripribbkitty"},
    {"message": "It's poky!!", "userId": "R3g1uZKu8_GrBh8cAAAC", "username": "pripribbkitty"},
    {"message": "She was missing last night", "userId": "R3g1uZKu8_GrBh8cAAAC", "username": "pripribbkitty"},
    {"message": "I swear", "userId": "R3g1uZKu8_GrBh8cAAAC", "username": "pripribbkitty"},
  ],
}

const nightWitchState = {
  ws:                 ws,
  mistSettings:       {
    canvasWidth:      600
  },
  user: {"id":"zPGaWdfEO1vI2O_aAAAB","isCreator":false,"isDead":false,"role":"villager","skip":false,"username":"jiji","voteFor":null,"trialVote":null,"killVote":[],"ghostVote":[]},
  "players": [
    {"id":"zPGaWdfEO1vI2O_aAAAB","isCreator":false,"isDead":false,"isMarked":false,"role":"witch","skip":false,"username":"jiji","voteFor":null,"trialVote":null,"killVote":[],"ghostVote":[]},
    {"id":"R3g1uZKu8_GrBh8cAAAC","isCreator":false,"isDead":false,"isMarked":true,"role":"villager","skip":false,"username":"pripribbkitty","voteFor":null,"trialVote":null,"killVote":[],"ghostVote":[]},
    {"id":"ei2W9aNW9FFSGZANAAAD","isCreator":false,"isDead":false,"isMarked":false,"role":"villager","skip":false,"username":"pokyCuddleDumplin IV","voteFor":null,"trialVote":null,"killVote":[],"ghostVote":[]},
    {"id":"R_2VVCGzEHWX0IDaAAAE","isCreator":true,"isDead":false,"isMarked":false,"role":"villager","skip":false,"username":"jordy","voteFor":null,"trialVote":null,"killVote":[],"ghostVote":[]}
  ],
  "prophetText":"Select someone to reveal thier secrets.",
  "witchText":"Select who shouldn't live any longer.",
  "dayText":"Select someone who is guilty or choose to skip today.",
  "lobbyId":"restless-bog-14",
  "started":true,
  "time":"night",
  "winner":null,
  "watching": null,
  "onTrial": null,
  "marking": "ei2W9aNW9FFSGZANAAAD",
  "messages": [
    {"message": "uuuuh", "userId": "R3g1uZKu8_GrBh8cAAAC", "username": "pripribbkitty"},
    {"message": "I'm villager for real", "userId": "R3g1uZKu8_GrBh8cAAAC", "username": "pripribbkitty"},
    {"message": "It's poky!!", "userId": "R3g1uZKu8_GrBh8cAAAC", "username": "pripribbkitty"},
    {"message": "She was missing last night", "userId": "R3g1uZKu8_GrBh8cAAAC", "username": "pripribbkitty"},
    {"message": "I swear", "userId": "R3g1uZKu8_GrBh8cAAAC", "username": "pripribbkitty"},
  ],
}

module.exports = { trialState, defaultState, nightState, nightWitchState };