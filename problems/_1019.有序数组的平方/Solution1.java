package _1019.有序数组的平方;

class Solution1 {
    public int[] sortedSquares(int[] nums) {
        int[] arr = new int[nums.length];
        int i = 0;
        int j = nums.length - 1;
        int k = nums.length - 1;
        while (i <= j) {
            int lv = nums[i] * nums[i];
            int rv = nums[j] * nums[j];
            if (lv > rv) {
                i++;
                arr[k] = lv;
                k--;
            } else {
                arr[k] = rv;
                j--;
                k--;
            }
        }
        return arr;
    }
}
