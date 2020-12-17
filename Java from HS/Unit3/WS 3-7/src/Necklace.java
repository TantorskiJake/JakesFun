import java.util.Scanner;
public class Necklace 
{
	public static void main(String[] args )
	{
	
	
	
	Scanner scan = new Scanner(System.in); 
	    int t1 = 0; 
	    int t2 = 0;
	    int steps=0;
	    int second;
	    int first;
	    
		System.out.print("Enter first starting number: ");
		 first = scan.nextInt(); 
		System.out.print("Enter second starting number : "); 
		 second = scan.nextInt(); 
		boolean correct = (first == t1)&&(second == t2);
		steps+=2;
	while(!correct)
		{ 
		t1 = (first + second)%10; 
		t2 = (second + t1)%10; 
	
		System.out.print( first + " " + second + " " + t1 + " " + t2); 
	
		correct = (first == t1)&&(second ==t2);
		steps+=2;
		}
	System.out.print(steps + "Steps.");
	
	/*
		//#2
		int numberofTrials = 1000;
		int totalSteps = 0 ;
		
		for (int i = 1; i <=numberofTrials; i++)
		{
			int steps = 0;
			int distance = 0;
			
			boolean walk = true;
			
			while(walk)
			{
				int walker = (int)(2*Math.random());
				
				if(walker == 0)
					distance++;
				else
					distance--;
				
				steps++;
				
				walk = (distance > -4 )&&(distance < 4);
			}
			totalSteps = totalSteps + steps;
			
		}
		System.out.print("Average number of steps are: " + (totalSteps/(double)(numberofTrials)));*/
	}
		
}
