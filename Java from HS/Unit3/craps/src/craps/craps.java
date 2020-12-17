
class crapsgame 
{

	public static void main(String[] args) 
	{

		int dice1 = 0;
		int dice2 = 0;
		int score = 0;
		int point = 0;
		int wins = 0;
		int loss = 0;
		int roll = dice1 + dice2;
		
		Random randomGenerator = new Random ();
		 int dice1 = randomGenerator.nextInt (6) + 1;
		 int dice2 = randomGenerator.nextInt (6) + 1;

		
		for(int i = 0; i < 10000; i++)
		{
			if (roll == 7 || roll == 11)
			{
				
				System.out.print("You win!");
				win = win + 1;
				
			}
			
			if (roll == 2 || roll == 3 || roll == 12)
			{
			
				
				
				
				
			}
			else
			{
				
				
				
				
			}
			
		}
		
		
			
			
			
			
			
			
			
			
		
	}

}
