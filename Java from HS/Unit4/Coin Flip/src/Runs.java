//****************************************************
//	Runs.java
//
//Find the length of the longest run of heads in 100 flips of a coin.
//****************************************************


public class Runs 
{

	public static void main(String[] args) 
	{
		final int FLIPS = 100;	//number of coin flips
		
		int currentRun = 0;	//length of the current run of HEADS
		int maxRun = 0;	//length of the maximum run so far
		
		//create coin object
		Coin penny = new Coin();
		
		//Flip the coin FLIPS times
		for(int i = 0; i < FLIPS; i++)
		{
			penny.flip();
			System.out.println(penny); // auto toString()
			
			//update the run information
			
			if(penny.getFace() == penny.HEADS)
			{
				currentRun++;
			}
			else
			{
				if(currentRun > maxRun)
					maxRun = currentRun;
				
				currentRun = 0;
				
				
			}
			
			
		}
		
		//print results
		System.out.println("The longest streak was " + maxRun);

	}
}
