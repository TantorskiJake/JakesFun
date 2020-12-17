
import java.util.Scanner;

/*     WordChain.java
 * 
 * 	   Input a sequence of words, outputs whether a word chain or not
 */

public class WordChain 
{
	public static void main(String args[])
	{
		//initializes a boolean variable to default true
		boolean wordChain = true;
		
		//scanner object for sequence of words & String to hold
		Scanner lineInput = new Scanner(System.in);
		String stringInput;
		
		//gets sequence of words from user separated by a space
		System.out.println("Enter a sequence of words: ");
		stringInput = lineInput.nextLine();
		
		//scanner object to scan sequence of words
		Scanner scanString = new Scanner(stringInput);
		
		//String variable to store individual words
		String word1;
		String word2;
		
		//gets next word in sequence
		word1 = scanString.next();
		word2 = scanString.next();
		int count ;
		count = 0;
		//make sure they input words before the enter in END
		while(!word1.equals("END") && !word2.equals("END") )
		{
			for(int i=0; i<word1.length(); i++)
			{
				//goes through each letter to see if they are the same or not
				if(word1.charAt(i) != word2.charAt(i))
					{
					//if not add 1 to the counter
						count++;
					}
			}
			//if the counter is above one the boolean has to change to false
			if(count!=1)
			{
				wordChain = false;
			}
			//makes the next word inot word one that way te for loop can just go through itslef untl END comes up	
			word1 = word2;
			word2 = scanString.next();
			count = 0;
		}
		//this decides what to output depending on the result
		if(wordChain)
			System.out.println("Sequence is a word chain");
		else
			System.out.println("Sequence is not a word chain");
				
		
		
	}

}

