// Jake Tantorski Sum of all even numbers from 0-1000

public class getEvenSum{
  public  static void main(String[] args){
    getEvenSum result = new getEvenSum();
    int finalSum = result.calcEvenSum();
    System.out.println(finalSum);
  }

  public int calcEvenSum(){
    int sum = 0;
    for(int i = 0; i <= 1000; i++){
    // for(int i = 2; i <= 1000; i+2) and remove if ()
      if(i%2==0){
        sum = i + sum;
      }
    }
    return sum; //250500 expected
  }
}
