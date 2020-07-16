//Jake Tantorski 7-16-2020
// Given an array of stock prices for which the 'ith' element is the price of a given stock on day 'i'.
// You can onnly complete one transaction per day



public class maxProfitCheck{
  // Fucntion to check maximum profit
  public int maxPCheck(int[] prices){
      int localMin = prices[0];
      int maxProfit = 0;

      for(int i = 1; i<prices.length; i++){
          // price at current index
          int currPrice = prices[i];
          // price at previous index
          int prevPrice = prices[i-1];

          if(currPrice < prevPrice){
            // checking to see if the new price is lower than the last
              int potentialProfit = prevPrice - localMin;
              if(potentialProfit > 0){
                  // add profit to maximum sum
                  maxProfit += potentialProfit;
              }
              localMin = currPrice;
          }
      }
      int finalProfit = prices[prices.length-1]-localMin;
      if(finalProfit > 0){
          // add profit to finalProfit calc to get actual maxProfit
          maxProfit += finalProfit;
      }
      return maxProfit;
  }


  public static void main(String[] args)
  {
    int[] intArray = new int[] {1,4,3,8}; //Expected: 8
    maxProfitCheck test = new maxProfitCheck();
    int finalResult = test.maxPCheck(intArray);
    System.out.println("Your Maximum Profit: " + finalResult);

  }
}
