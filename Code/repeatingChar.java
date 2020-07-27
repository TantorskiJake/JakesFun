public class repeatingChar{
  public static void main(String[] args) {
  String str = "That is the best";
  int[] arr = str.split("");
  int charCounter = {};
  for(int i = 0; i < arr.length; i++){
    char currChar = arr[i];
    if(charCounter[currChar]){
      charCounter[currChar]++;
    }
    else{
      charCounter[currChar]=1;
    }
  }
  int[] repeatChar;
  for(int char in charCounter){
    if(charCounter[char] > 1){
    repeatChar.push(char);
    }
  }
  System.out.println("Repeating Chars:"+ repeatChar);
  }

}
