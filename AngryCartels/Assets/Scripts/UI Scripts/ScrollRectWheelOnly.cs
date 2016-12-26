using UnityEngine.UI;
using System.Collections;
using UnityEngine.EventSystems;
using UnityEditor;

[CustomEditor(typeof(ScrollRect), true)]
public class ScrollRectWheelOnly : ScrollRect
{
    public override void OnBeginDrag(PointerEventData eventData) { }
    public override void OnDrag(PointerEventData eventData) { }
    public override void OnEndDrag(PointerEventData eventData) { }
}
