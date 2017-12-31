using UnityEngine;
using System;

public enum LogMsgType
{
    DEBUG,
    ERROR,
    WARNING
}

public abstract class Logger
{

    public static void w(string label, string message, params object[] items)
    {
        PrintMessage(LogMsgType.WARNING, label, message, items);
    }

    public static void e(string label, string message, params object[] items)
    {
        PrintMessage(LogMsgType.ERROR, label, message, items);
    }

    public static void d(string label, string message, params object[] items)
    {
        PrintMessage(LogMsgType.DEBUG, label, message, items);
    }

    public static void PrintMessage(LogMsgType type, string label, string message, params object[] items)
    {

        string formattedBody;
        if (items.Length > 0)
        {
            formattedBody = string.Format(message, items);
        }
        else
        {
            formattedBody = message;
        }

        string formattedMessage = string.Format("[{0}] ( {1} ) {2}", DateTime.Now.ToString("HH:mm:ss:FFF"), label, formattedBody);

        switch (type)
        {
            case LogMsgType.DEBUG:
                Debug.Log(formattedMessage);
                break;
            case LogMsgType.ERROR:
                Debug.LogError(formattedMessage);
                break;
            case LogMsgType.WARNING:
                Debug.LogWarning(formattedMessage);
                break;
        }
    }
}
