using UnityEngine;
using System.Collections;
using System.Collections.Generic;

/// <summary>
/// Dictionary with default value. WARNING: DO NOT UPCAST TO DICTIONARY!
/// WILL IGNORE THIS CLASSES GET ITEM METHOD
/// </summary>
/// <typeparam name="TKey"></typeparam>
/// <typeparam name="TValue"></typeparam>
public class DictionaryWithDefault<TKey, TValue> : Dictionary<TKey, TValue>
{
    TValue _default;
    public TValue DefaultValue
    {
        get { return _default; }
        set { _default = value; }
    }
    public DictionaryWithDefault() : base() { }
    public DictionaryWithDefault(TValue defaultValue) : base()
    {
        _default = defaultValue;
    }
    public new TValue this[TKey key]
    {
        get
        {
            TValue t;
            return base.TryGetValue(key, out t) ? t : _default;
        }
        set { base[key] = value; }
    }
}



class SetList<TValue> : List<TValue>
{
    public void AddToSet(TValue item)
    {
        if (!base.Contains(item))
        {
            base.Add(item);
        }
    }
}
