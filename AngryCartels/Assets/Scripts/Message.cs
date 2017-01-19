using UnityEngine;
using System.Collections;
using System;

public class Message
{
    // Getter for the messageId
    protected string messageId;
    public string MessageId
    {
        get { return messageId; }
    }

    // Getter for the Message Data
    private object[] messageData;
    
    // Ctor requires message type and data to be passed
    public Message(string id, params object[] data)
    {
        messageId = id;
        messageData = data;
    }

    // Retreives the data from from this message
    // An index can be specified to retrieve multiple params
    public T GetData<T>(int index = 0)
    {
        if (index >= messageData.Length)
        {
            throw new IndexOutOfRangeException("The specified index is out of range");
        }
        return (T)messageData[index];
    }
}