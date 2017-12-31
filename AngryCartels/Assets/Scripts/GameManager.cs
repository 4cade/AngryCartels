using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;


/// <summary>
/// This is responsible for game level actions like saving prefs,
/// starting and stopping the game, adjusting settings, etc...
/// </summary>
public class GameManager : MonoBehaviour {

    // Used to spoof the inspector so Managers can be configured like a dictionary.
    [System.Serializable]
    public class SceneManagerEntry
    {
        public int sceneIndex;
        public GameObject sceneGuiPrefab;
        public GameObject sceneManagerPrefab;
    }

    private static GameManager instance;
    public static GameManager Instance
    {
        get
        {
            if (instance == null)
            {
                Debug.LogError("Game Manager IS NULL YOU TWAT");
            }
            return instance;
        }
    }

    private GameSceneManager currentSceneManager;
    public GameSceneManager CurrentSceneManager
    {
        get
        {
            return currentSceneManager;
        }
    }

    public GameCanvas Canvas;

    [HideInInspector]
    public User currentUser; // Probably need a better way to log in TODO

    public SceneManagerEntry[] Managers;


    private void Awake()
    {
        Logger.d("GameManager", "GameManager::Awake");
        if (instance == null)
        {
            instance = this;
        }
        else
        {
            Logger.e("GameManager", "GameManager instance is already set, did you instantiate twice?");
        }

        DontDestroyOnLoad(gameObject);
    }

    private void Start()
    {
        Canvas = GameObject.Find("Canvas").GetComponent<GameCanvas>();

        int currentSceneIndex = SceneManager.GetActiveScene().buildIndex;
        SwitchScene(currentSceneIndex, false); // Don't reload the same scene again on startup
    }

    public void SwitchScene(int sceneIndex, bool loadNextScene = true)
    {
        SceneGui currentSceneGui = GameCanvas.currentSceneGui;

        SceneManagerEntry nextEntry = null;

        foreach (SceneManagerEntry entry in Managers)
        {
            if (entry.sceneIndex == sceneIndex)
            {
                nextEntry = entry;
                break;
            }
        }

        GameObject sceneObj = Instantiate(nextEntry.sceneManagerPrefab);
        GameSceneManager nextSceneManager = sceneObj.GetComponent<GameSceneManager>();

        if (currentSceneManager != null)
        {
            currentSceneManager.OnSceneExit();
            Destroy(currentSceneManager.gameObject);
        }
        
        currentSceneManager = nextSceneManager;

        // make canvas parent
        currentSceneManager.transform.parent = transform;
        
        // transition into the scene
        currentSceneManager.OnSceneEnter();

        if (loadNextScene)
        {
            Logger.d("GameManager", "Loading next Unity scene...");
            SceneManager.LoadScene(sceneIndex);
        }

        Canvas.SwitchSceneGui(nextEntry.sceneGuiPrefab);
    }

    public void SetUpTestGame(Message obj)
    {
        Logger.d("GameManager", "Test Game Data has been received");
        MessageBus.Instance.Unregister(GameMessages.GAME_DATA_UPDATED, SetUpTestGame);
        SwitchScene(0);
        (currentSceneManager as BoardSceneManager).SetUpBoard();
    }

}
