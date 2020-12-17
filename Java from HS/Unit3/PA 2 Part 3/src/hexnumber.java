//Bowen Brennan and Jake Tantorski
//Mr. Hughes
//AP Comp Sci
//October 12, 2016

public class hexnumber
{
	//instance variables
	private int number;
	private int base;
	
	//constructor initializing variables
	public hexnumber(int numIn, int baseIn)
	{
		number = numIn;
		base = baseIn;
	}
	
	//Accessor methods
	
	//returns final JOptionPane Message - answer
	public String toString()
	{
		return "The number " + number + " in base "+ base + " is " + convertedNum();
	}
	
	//Conversion method
	private String convertedNum()
	{
		int place0;
		int place1;
		int place2;
		int place3;
	
		if(base >=2 && base <=9)
		{
			place0 = number%base;
			number = (int) number/base;
		
			place1 = number%base;
			number = (int) number/base;
		
			place2 = number%base;
			number = (int) number/base;
		
			place3 = number%base;
			number = (int) number/base;
			
			return (""+place3+place2+place1+place0);
		}
		
		if( base == 16)
		{
			place0 = number%base;
			number = (int) number/base;
		
			place1 = number%base;
			number = (int) number/base;
		
			place2 = number%base;
			number = (int) number/base;
		
			place3 = number%base;
			number = (int) number/base;
			
			if(place0 ==  10)
				place0 = Integer.parseInt("A");
			//make a new method
			
			return (""+place3+place2+place1+place0);
		}
	return null;
			
				
				
				
				
				
				
				
				
				
		
	}
	
	//Method to calculate maximum number within 4 digits
	public static int maxNumber(int base)
	{
		return ((int)(Math.pow(base, 4)-1));
	}
}
