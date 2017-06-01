using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System;

/// <summary>
/// Singlton MessageBus class can pass variable abouts of data
/// between objects.
/// </summary>
public class MessageBus
{
    /// <summary>
    /// Declare class as singleton
    /// </summary>    
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

    /// <summary>
    /// holds all registered subscribers for a particular event T
    /// </summary>    
    private Dictionary<string, List<Action<Message>>> subscribers;

    /// <summary>
    /// Ctor: create the dictionary
    /// </summary>
    private MessageBus()
    {
        subscribers = new Dictionary<string, List<Action<Message>>>();
    }

    /// <summary>
    /// Register the specified action with the T id
    /// </summary>
    /// <param name="id">The string id to register</param>
    /// <param name="onPublisherReceive">The function delegate that will be called
    /// when a message with 'id' is invoked.</param>    
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

    /// <summary>
    /// Loops through all subscribers registered to the specified id
    /// </summary>
    /// <param name="id">The id of the message.</param>
    /// <param name="data">The variable data to send to each object listening.</param>
    internal void Broadcast(string id, params object[] data)
    {
        List<Action<Message>> actionList = subscribers[id];
        Message message = new Message(id, data);

        foreach (Action<Message> action in actionList)
        {
            action.Invoke(message);
        }
    }

    /// <summary>
    /// Loops through all subscribers registered to the specified id
    /// </summary>
    /// <param name="message">The message to send to all objects listening.</param>
    internal void Broadcast(Message message)
    {
        List<Action<Message>> actionList = subscribers[message.MessageId];

        foreach (Action<Message> action in actionList)
        {
            action.Invoke(message);
        }
    }
}
