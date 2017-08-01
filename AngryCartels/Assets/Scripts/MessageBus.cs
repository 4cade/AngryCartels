using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System;

/// <summary>
/// Singlton MessageBus class can pass variable abouts of data
/// between objects. TODO: add clear bus and clear message.
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
    /// Holds a list of messages that were sent before a subscriber 
    /// was registered
    /// </summary>
    private Dictionary<string, List<Message>> backlog;

    /// <summary>
    /// Ctor: create the dictionary
    /// </summary>
    private MessageBus()
    {
        subscribers = new Dictionary<string, List<Action<Message>>>();
        backlog = new Dictionary<string, List<Message>>();
    }

    /// <summary>
    /// Register the specified action with the T id
    /// </summary>
    /// <param name="id">The string id to register</param>
    /// <param name="onPublisherReceive">The function delegate that will be called
    /// when a message with 'id' is invoked.</param>    
    public void Register(string id, Action<Message> onPublisherReceive)
    {
        // Check if the id already exists
        if (!subscribers.ContainsKey(id))
        {
            subscribers[id] = new List<Action<Message>>();
        }
        subscribers[id].Add(onPublisherReceive);

        // check if there is anything stored in the backlog
        // if there is, then send it
        if (backlog.ContainsKey(id))
        {
            List<Message> messageList = backlog[id];

            foreach(Message m in messageList)
            {
                Broadcast(m.ID, m.Data);
            }

            messageList.Clear();
        }
    }

    /// <summary>
    /// Loops through all subscribers registered to the specified id
    /// </summary>
    /// <param name="id">The id of the message.</param>
    /// <param name="data">The variable data to send to each object listening.</param>
    public void Broadcast(string id, params object[] data)
    {
        List<Action<Message>> actionList = subscribers[id];
        Message message = new Message(id, data);

        foreach (Action<Message> action in actionList)
        {
            action.Invoke(message);
        }
    }

    /// <summary>
    /// Loops through all subscribers registered to the specified id. Could also use
    /// this method to send messages before subscribers are registered
    /// </summary>
    /// <param name="message">The message to send to all objects listening.</param>
    public void Broadcast(Message message)
    {
        if (!subscribers.ContainsKey(message.ID))
        {
            // if we want this message to reach its future consumer
            // add it to the backlog
            if (!message.DeleteIfNoReceivers)
            {
                if (!backlog.ContainsKey(message.ID))
                {
                    backlog[message.ID] = new List<Message>();
                }

                backlog[message.ID].Add(message);
            }
        }
        else
        {
            List<Action<Message>> actionList = subscribers[message.ID];
            foreach (Action<Message> action in actionList)
            {
                action.Invoke(message);
            }
        }
    }

}
