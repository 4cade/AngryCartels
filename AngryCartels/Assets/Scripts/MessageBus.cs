using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System;

public class MessageBus
{
    // Declare class as singleton
    private static MessageBus instance;
    public static MessageBus Instance
    {
        get
        {
            if (instance == null)
            {
                instance = new MessageBus();
            }
            return instance;
        }
    }

    // holds all registered subscribers for a particular event T
    private Dictionary<string, List<Action<Message>>> subscribers;

    // Ctor: create the dictionary
    private MessageBus()
    {
        subscribers = new Dictionary<string, List<Action<Message>>>();
    }

    // Register the specified action with the T id
    internal void Register(string id, Action<Message> onPublisherReceive)
    {
        // Check if the id already exists
        if (subscribers.ContainsKey(id))
        {
            subscribers[id].Add(onPublisherReceive);
        }
        else // otherwise create a new list of subscribers for that id
        {
            List<Action<Message>> actionList = new List<Action<Message>>();
            actionList.Add(onPublisherReceive);
            subscribers.Add(id, actionList);
        }
    }

    // Loops through all subscribers registered to the specified id
    internal void Broadcast(string id, params object[] data)
    {
        List<Action<Message>> actionList = subscribers[id];
        Message message = new Message(id, data);

        foreach (Action<Message> action in actionList)
        {
            action.Invoke(message);
        }
    }

    // Loops through all subscribers registered to the specified id
    internal void Broadcast(Message message)
    {
        List<Action<Message>> actionList = subscribers[message.MessageId];

        foreach (Action<Message> action in actionList)
        {
            action.Invoke(message);
        }
    }
}
