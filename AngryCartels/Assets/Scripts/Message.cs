using UnityEngine;
using System.Collections;
using System;

/// <summary>
/// A message hold information to be passed between objects.
/// </summary>
public class Message
{
    /// <summary>
    /// Getter for the messageId
    /// </summary>
    protected string messageId;
    public string ID
    {
        get { return messageId; }
    }

    /// <summary>
    /// Getter for the Message Data
    /// </summary>
    protected object[] messageData;
    public object[] Data
    {
        get { return messageData; }
    }

    /// <summary>
    /// If this is set to false, the message will persist until
    /// a receiver has consumed the message via MessageBus.Broadcast
    /// Default is true
    /// </summary>
    protected bool deleteIfNoReceivers;
    public bool DeleteIfNoReceivers
    {
        get { return deleteIfNoReceivers; }
        set { deleteIfNoReceivers = value; }
    }
    

    /// <summary>
    /// Ctor requires message type and data to be passed
    /// </summary>
    /// <param name="id">The string id of the message</param>
    /// <param name="data">The variable number of arguments to pass.</param>
    public Message(string id, params object[] data)
    {
        messageId = id;
        messageData = data;
        deleteIfNoReceivers = true;
    }

    /// <summary>
    /// Retreives the data from from this message
    /// An index can be specified to retrieve multiple params.
    /// NOTE: the caller of GetData should perform their own 
    /// error checking if the return value is invalid.
    /// </summary>
    /// <typeparam name="T">The type expected to return</typeparam>
    /// <param name="index">If multiple items were passed to this message,
    /// access each item by index.</param>
    /// <returns></returns>    
    public T GetData<T>(int index = 0)
    {
        if (index >= messageData.Length)
        {
            throw new IndexOutOfRangeException("The specified index is out of range");
        }

        if (typeof(T).IsArray)
        {
            T obj = (T)((object)(messageData[index]));
            return obj;
        }

        return (T)messageData[index];
    }
}