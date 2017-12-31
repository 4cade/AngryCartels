using System;
using System.Collections;
using System.Collections.Generic;
using SocketIO;
using UnityEngine;
using UnityEngine.SceneManagement;

/// <summary>
/// The Network manager exists across scenes to communicate with the javascript
/// server.
/// NOTES:
/// We probably should only send the lobby hosts when searching for a lobby
/// and not include the players already in that lobby.
/// </summary>
public class NetworkManager : MonoBehaviour {

    private static NetworkManager instance;
    public static NetworkManager Instance
    {
        get
        {
            if (instance == null)
            {
                Debug.LogError("NETWORK MANAGER IS NULL YOU TWAT");
            }
            return instance;
        }
    }

    // The build index for the title scene
    public int titleScene;

    // The build index for the game scene.
    public int gameScene;

    private GameState gameState;

    private SocketIO.SocketIOComponent socket;

    /// <summary>
    /// Called after this object is created, NOTE: not all game objects may 
    /// exist yet.
    /// </summary>
    void Awake()
    {
        if (instance == null)
        {
            instance = this;
        }
        else
        {
            Logger.e("NetworkManager", "Trying to reinstantiate singlton");
        }

        // Register MessageBus Events     
        MessageBus.Instance.Register("refresh", RefreshLobbies);
        MessageBus.Instance.Register("join_lobby", JoinLobby);
        MessageBus.Instance.Register("create_game", CreateGame);
        //MessageBus.Instance.Register("start_game", StartGame);
        MessageBus.Instance.Register("ping_lobbies", GetGames);

        DontDestroyOnLoad(gameObject); // Create this object between scenes
    }

    /// <summary>
    /// Called when we want to ask the server what game lobbies exist.
    /// </summary>
    /// <param name="obj">null</param>
    private void GetGames(Message obj)
    {
        socket.Emit(GameSocketMessages.GET_GAMES);
    }

    /// <summary>
    /// Called when we want to start the game as the host.
    /// </summary>
    /// <param name="obj"></param>
    private void StartGameAsHost(Message obj)
    {
        socket.Emit(GameSocketMessages.START_GAME);
        //StartGame(null);
    }

    // Use this for initialization
    void Start()
    {
        gameState = GameObject.Find("GameState").GetComponent<GameState>();

        socket = GetComponent<SocketIO.SocketIOComponent>();

        socket.On(GameSocketMessages.SEND_CLIENT_NAME, ClientNameCallback);
        socket.On(GameSocketMessages.UPDATED_GAMES, UpdatedGamesCallback);
        socket.On(GameSocketMessages.IN_ROOM, InRoom);
        socket.On(GameSocketMessages.START_GAME, StartGame);

        // In Game Messages
        socket.On(GameSocketMessages.GAME_DATA, OnGameStateUpdate);
        socket.On(GameSocketMessages.NEXT_TURN, OnNextTurn);
        socket.On(GameSocketMessages.MOVEMENT, OnMovement);
        socket.On(GameSocketMessages.PROPERTY_BOUGHT, OnPropertyBought);
        socket.On(GameSocketMessages.SPECIAL_CARD, OnSpecialCard);
        socket.On(GameSocketMessages.DRAW_BUS_PASS, OnDrawBusPass);
        socket.On(GameSocketMessages.PROPERTY_INFO, OnPropertyInfo);
        socket.On(GameSocketMessages.RENT_INFO, OnRentInfo);
        socket.On(GameSocketMessages.HIGHEST_RENT, OnHighestRent);
        socket.On(GameSocketMessages.ALL_LOCATIONS, OnAllLocations);
        socket.On(GameSocketMessages.ALL_UNOWNED, OnAllUnowned);
        socket.On(GameSocketMessages.ACTIONS, OnActions);
        socket.On(GameSocketMessages.NEW_AUCTION, OnNewAuction);
        socket.On(GameSocketMessages.NEW_AUCTION_PRICE, OnNewAuctionPrice);
        socket.On(GameSocketMessages.AUCTION_WINNER, OnNewAuctionWinner);
    }

    #region Listening

    /// <summary>
    /// TODO: Gets called when there is an auction winner. Find and change GameObject values
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnNewAuctionWinner(SocketIOEvent obj)
    {
        // passed from backend is json = { "player": player.name, "location": this.auctionedProperty, "price": price, "actions": player.getActions()};
        string data = obj.data.ToString();
        Debug.Log(data);
        AuctionJSON newAuctionWinnerJSON = AuctionJSON.CreateFromJSON(data);
        // Gives newAuctionWinnerJSON.player as json.player
        // Gives newAuctionWinnerJSON.location as json.location
        // Gives newAuctionWinnerJSON.price as int json.price
        // Gives newAuctionWinnJSON.actions as json.actions // is this needed?

        // This probably falls under OnPropertyBought functionality
            // Functionality
            GameObject playerObject = GameObject.Find(newAuctionWinnerJSON.player); // GameObject? JSON? 
            // playerScript.playerMoney  = playerScript.playerMoney - NewAuctionWinnerJSON.auctionPrice
            // playerScript.Cards.Add(propertyName). How to get Card Index? and List<String> ?

        // Destroy Auction Instance
        string auctionObjectName = newAuctionWinnerJSON.location + " Auction";
        Destroy(GameObject.Find("auctionObjectName")); // finished Auction

        // TODO: verify backend changes location to owned
    }

    /// <summary>
    /// TODO: Gets called when there is a new auction price
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnNewAuctionPrice(SocketIOEvent obj)
    {
        // Not currently set up in backend... AngryCartels/blob/master/backend/sychronizer.js
        // Would want to send player name, property name, bid price, potentially player actions
        string data = obj.data.ToString();
        Debug.Log(data);
        AuctionJSON auctionJSON = AuctionJSON.CreateFromJSON(data);
        string auctionObjectName = auctionJSON.location+" Auction";
        GameObject auctionObject = GameObject.Find("auctionObjectName");
        // TODO: Update Auction GameObject Price
    }

    /// <summary>
    /// TODO: Gets called when there is a new auction
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnNewAuction(SocketIOEvent obj)
    {
        // obj gives location properties
        string data = obj.data.ToString();
        string auctionPropertyName = obj.data.GetField("name").ToString(); // to only take property name in creation of auctionJSON
        Debug.Log(data);
        AuctionJSON newAuctionJSON = AuctionJSON.CreateFromJSON(data);
        GameObject auctionObject = (GameObject)Instantiate(Resources.Load("ActionUiItem")); // Create a new Auction GameObject
        //Todo: create custom Auction GameObject and add properties
        auctionObject.name = auctionPropertyName + " Auction";
        // Gives newAuctionJSON.player as null
        // Gives newAuctionJSON.location as json.location
        // Gives newAuctionJSON.price as int null
        // Gives newAuctionJSON.actions as null // is this needed?
        // Create new Auction object with property name
    }

    /// <summary>
    /// TODO: Gets called when we want to ask the server for player actions.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnActions(SocketIOEvent obj)
    {
        //message from server: { 'message': message, "player": this.playerManager.getCurrentPlayer().name, "actions": player.getActions()}
        string data = obj.data.ToString();
        Debug.Log(data);
        ActionListJSON actionListJSON = ActionListJSON.CreateFromJSON(data);
        //actionListJSON.message = json.message
        //actionListJSON.player = json.player
        //actionListJSON.actions = json.actions
        // Where to store action?
    }

    /// <summary>
    /// TODO: Gets called when the server returns all unowned property.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnAllUnowned(SocketIOEvent obj)
    {
        // currently server emits string of unowned properties... not JSON
        string data = obj.data.ToString();
        Debug.Log(data);
        //UnownedPropertyNamesJSON unownedPropertyNamesJSON = UnownedPropertyNamesJSON.CreateFromJSON(data);
    }

    /// <summary>
    /// TODO: Response when the server is asked about all locations.
    /// </summary> 
    /// <param name="obj">JSON data.</param>
    private void OnAllLocations(SocketIOEvent obj)
    {
        // currently server gives string of owned properties... not JSON
        string data = obj.data.ToString();
        Debug.Log(data);
        //AllPropertyNamesJSON allPropertyNamesJSON = AllPropertyNamesJSON.CreateFromJSON(data);
    }

    /// <summary>
    /// TODO: Response when server is asked about the highest rent.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnHighestRent(SocketIOEvent obj)
    {
        // gives location properties of highest rent from owned locations
        string data = obj.data.ToString();
        Debug.Log(data);
        PropertyJSON highestRentProperty = PropertyJSON.CreateFromJSON(data);
    }

    /// <summary>
    /// TODO: Response when the server is asked about rent information.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnRentInfo(SocketIOEvent obj)
    {
        // receives {"name": property, "price": rent}
        string data = obj.data.ToString();
        Debug.Log(data);
        RentJSON rentJSON = RentJSON.CreateFromJSON(data);
        //rentJSON.name = location name
        //rentJSON.price = rent
    }

    /// <summary>
    /// TODO: Response when the server is asked about property informatation
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnPropertyInfo(SocketIOEvent obj)
    {
        // gives location properties of specified location
        string data = obj.data.ToString();
        Debug.Log(data);
        PropertyJSON highestRentProperty = PropertyJSON.CreateFromJSON(data);
    }

    /// <summary>
    /// TODO: Response when a bus pass is draw.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnDrawBusPass(SocketIOEvent obj)
    {
        // receive {"card": card, "player": {"name": player.name}, "message": message, "actions": player.getActions()};
        // how to handle "player": {"name": player.name}?
        // can we change backend to just give player name?
        string data = obj.data.ToString();
        Debug.Log(data);
        DrawCardJSON drawBusPass = DrawCardJSON.CreateFromJSON(data);

        // Functionality
        // GameObject playerObject = GameObject.Find(drawBusPass.player.GetField("name")); // test how this works
        // GameObject playerObject = GameObject.Find(drawBusPass.player); // if backend just uses player name instead of  "player": {"name": player.name}
        // playerScript.Cards.Add(?). How to determine Dictionary List<string> index?
        // playerScript.Actions = drawBusPass.actions
        // what to do with message? put on card UI?
    }

    /// <summary>
    /// TODO: Repsponse when a special card is drawn.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnSpecialCard(SocketIOEvent obj)
    {
        // receive {"card": card, "player": {"name": player.name}, "message": message, "actions": player.getActions()};
        // how to handle "player": {"name": player.name}?
        // can we change backend to just give player name?
        string data = obj.data.ToString();
        Debug.Log(data);
        DrawCardJSON drawSpecialCard = DrawCardJSON.CreateFromJSON(data);
        
        // Functionality
        // GameObject playerObject = GameObject.Find(drawBusPass.player.GetField("name")); // test how this works
        // GameObject playerObject = GameObject.Find(drawBusPass.player); // if backend just uses player name instead of  "player": {"name": player.name}
        // TODO:
        // playerScript has separate sections for BusPasses and Special Cards. how to handle?
        // playerScript.Cards.Add(?). How to determine Dictionary List<string> index?
        // playerScript.Actions = drawSpecialCard.actions
    }

    /// <summary>
    /// TODO: Response when property is bought.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnPropertyBought(SocketIOEvent obj)
    {
        // Server sends {'player': {'name': player.name, 'money': player.getMoney()},'location': property,'price': lose, 'message': message, 'actions', player.getActions()}}
        // How to handle 'player': {'name': player.name, 'money': player.getMoney()}
        string data = obj.data.ToString();
        Debug.Log(data);
        AuctionJSON boughtProperty = AuctionJSON.CreateFromJSON(data);
        
        // Functionality
        GameObject playerObject = GameObject.Find(boughtProperty.player); 
        // GameObject? JSON? 
        // playerScript.playerMoney  = playerScript.playerMoney - NewAuctionWinnerJSON.auctionPrice
        // playerScript.Cards.Add(propertyName). How to get Card Index? and List<String> ?
    }

    /// <summary>
    /// TODO: Response when a player moves tiles.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnMovement(SocketIOEvent obj)
    {
        // returns {'player': {'name': player.name, 'money': player.getMoney()},'movedTo': visited,'actions': this.locationAction(player.location), 'message':message}
        // how to handle {'player': {'name': player.name, 'money': player.getMoney()}
        string data = obj.data.ToString();
        Debug.Log(data);
        MovementJSON movementJSON = MovementJSON.CreateFromJSON(data);
        
        // Functionality
        // GameObject playerObject = GameObject.Find(movementJSON.player.name); // Check functionality
        // GameObject? JSON? 
        // playerScript.playerMoney  = playerScript.playerMoney - NewAuctionWinnerJSON.auctionPrice
        // playerScript does not have actions field
    }

    /// <summary>
    /// TODO: Response when it is the next turn.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnNextTurn(SocketIOEvent obj)
    {
        string data = obj.data.ToString();
        Debug.Log(data);
    }

    /// <summary>
    /// TODO: Response when the game data is queried.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void OnGameStateUpdate(SocketIOEvent obj)
    {
        Logger.d("NetworkManager", "Game Data: " + obj);
        gameState.UpdateGameState(obj.data);
    }

    /// <summary>
    /// Response when the game is started.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void StartGame(SocketIOEvent obj)
    {
        if (SceneManager.GetActiveScene().buildIndex != gameScene)
        {
            Logger.d("NetworkManager", "Starting Game Should happen here");
            //SceneManager.LoadScene(gameScene);
        }
    }

    #endregion Listening

    # region Commands

    /// <summary>
    /// What gets called when the player wants to join a lobby.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void JoinLobby(Message obj)
    {
        string name = obj.GetData<string>();
        socket.Emit(GameSocketMessages.JOIN_GAME, name);
    }

    /// <summary>
    /// Called when the player creates a game.
    /// </summary>
    /// <param name="obj"></param>
    private void CreateGame(Message obj)
    {
        socket.Emit(GameSocketMessages.CREATE_GAME);
    }

    /// <summary>
    /// Called when the user wants to refresh the lobbies.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void RefreshLobbies(Message obj)
    {
        socket.Emit(GameSocketMessages.GET_GAMES);
    }

    /// <summary>
    /// Called whne the player logs into the server
    /// </summary>
    /// <param name="obj">Player Name</param>
    public void CmdLogIn(string playerName)
    {
        JSONObject json = new JSONObject();
        json.AddField("username", playerName);
        socket.Emit(GameSocketMessages.JOIN, json);
    }

    #endregion Commands

    /// <summary>
    /// Called when the player joins a room.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void InRoom(SocketIOEvent obj)
    {
        Logger.w("NetworkManager", "If updated games message is received after the " 
            + "join game message, then the player lobby wont be properly displayed.");
        MessageBus.Instance.Broadcast("joined_room", obj.data);
    }


    /// <summary>
    /// Called when the server has set the player's name.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void ClientNameCallback(SocketIOEvent obj)
    {
        Logger.d("NetworkManager", "ClientNameCallback " + obj.data.ToString());
    }

    /// <summary>
    /// Gets called when there is an updated games request.
    /// </summary>
    /// <param name="obj">JSON data.</param>
    private void UpdatedGamesCallback(SocketIOEvent obj)
    {
        MessageBus.Instance.Broadcast(new Message("title_response_received", TitleResponseType.LOBBY_UPDATE, obj.data));
    }

    #region JSONMessageClasses
    [Serializable]
    public class ActionListJSON
    {
        public string message;
        public string player;
        public string[] actions;

        public static ActionListJSON CreateFromJSON(string data)
        {
            return JsonUtility.FromJson<ActionListJSON>(data);
        }
    }

    [Serializable]
    public class AuctionJSON
    {
        public string player;
        public string location;
        public int price;
        // public List<string> actions; // is this needed?
        public static AuctionJSON CreateFromJSON(string data)
        {
            // TODO: wrap this in try/catch to handle deserialization exceptions
            return JsonUtility.FromJson<AuctionJSON>(data);
        }
    }

    [Serializable]
    public class AllPropertyNamesJSON
    {
        public string[] names;

        public static AllPropertyNamesJSON CreateFromJSON(string data)
        {
            // TODO: wrap this in try/catch to handle deserialization exceptions
            return JsonUtility.FromJson<AllPropertyNamesJSON>(data);
        }
    }

    [Serializable]
    public class DrawCardJSON
    {
        string card;
        JSONObject player; // TODO test this works?
        // string player; // if backend just uses player name instead of  "player": {"name": player.name}
        string message;
        string[] actions;

        public static DrawCardJSON CreateFromJSON(string data)
        {
            // TODO: wrap this in try/catch to handle deserialization exceptions
            return JsonUtility.FromJson<DrawCardJSON>(data);
        }
    }

    [Serializable]
    public class MovementJSON
    {
        JSONObject player;
        string[] movedTo; // locations visited by player
        string[] actions;
        string message;

        public static MovementJSON CreateFromJSON(string data)
        {
            // TODO: wrap this in try/catch to handle deserialization exceptions
            return JsonUtility.FromJson<MovementJSON>(data);
        }
    }

    [Serializable]
    public class PropertyJSON
    {
        public string name;
        public string type;
        public List<string> forward;
        public List<string> backward;
        public List<int> num;
        public List<string> below;
        public bool snapshot;
        public int group;
        public List<int> rent;
        public int mortgageValue;
        public int cost;
        public string owner;
        public bool isMortgaged;
        public int houses;
        public int housePrice;

        public static PropertyJSON CreateFromJSON(string data)
        {
            // TODO: wrap this in try/catch to handle deserialization exceptions
            return JsonUtility.FromJson<PropertyJSON>(data);
        }
    }

    [Serializable]
    public class UnownedPropertyNamesJSON
    {
        public string[] names;

        public static UnownedPropertyNamesJSON CreateFromJSON(string data)
        {
            // TODO: wrap this in try/catch to handle deserialization exceptions
            return JsonUtility.FromJson<UnownedPropertyNamesJSON>(data);
        }
    }
    
    [Serializable]
    public class RentJSON
    {
        public string name;
        public int price;

        public static RentJSON CreateFromJSON(string data)
        {
            return JsonUtility.FromJson<RentJSON>(data);
        }
    }
    #endregion
}
