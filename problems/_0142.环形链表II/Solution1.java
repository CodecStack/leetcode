package _0142.环形链表II;

import innerclass.ListNode;

/**
 * Definition for singly-linked list.
 * class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode(int x) {
 *         val = x;
 *         next = null;
 *     }
 * }
 */
class Solution1 {
    public ListNode detectCycle(ListNode head) {
        if (head == null || head.next == null) return null;
        ListNode p1 = head;
        ListNode p2 = head;
        while (p1.next != null && p1.next.next != null) {
            p1 = p1.next.next;
            p2 = p2.next;
            if (p1 == p2) {
                ListNode c1 = head;
                ListNode c2 = p1;
                while (c1 != c2) {
                    c1 = c1.next;
                    c2 = c2.next;
                }
                return c1;
            }
        }
        return null;
    }
}
