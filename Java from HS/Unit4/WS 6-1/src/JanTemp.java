//Jake Tantorski
//12/15/16
public class JanTemp 

{
	
	public static void main(String[] args)
	{
		
		int[] janTemp =new int[31];
		int low = 1000;
		int high = -1000;
		int average = 0;
		int lowDate = 0;
		int highDate = 0;
		janTemp[0] = 23;
		janTemp[1] = 32;
		janTemp[2] = 13;
		janTemp[3] = 18;
		janTemp[4] = 29;
		
		
		for(int i =0; i < 5; i++)
		{
			System.out.println("January " + (i+1) +": " + janTemp[i]);
		}
		
		
		for(int i = 5; i < janTemp.length; i++)
		{
			janTemp [i] = (int) (46*Math.random() - 5);
			System.out.println("January " + (i+1) +": " + janTemp[i]);
		}
		
		
		
		
		
		
		
		for( int i = 0; i < janTemp.length; i++)
		{
			average = average + janTemp[i];
			
			if(janTemp[i]<low)
			{
				low = janTemp[i];
				lowDate = i +1 ;
			}
			
			if(janTemp[i]>high)
			{
				high = janTemp[i];
				highDate = i +1 ;
			}
		}
		System.out.println("\nThe average temperature in January is: " + average/janTemp.length);
		System.out.println("\nThe lowest temperature is: " + low + " degrees on January " + lowDate);
		System.out.println("\nThe highest temperature is: " + high+ " degrees on January " + highDate);
		System.out.println("\nThe temperature on January 10th is : " + janTemp[9]);
	}

}
