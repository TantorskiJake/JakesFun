
public class Bush extends Plant implements PlantInterface 

{
		

		public Bush(int xCoor, int yCoor) 
		{
			super(xCoor,yCoor);
			width = 24;
			height =30;
			
		}

		public void  grow(int days)
		{
			height = height + (growthRate*days);
			width = width + (growthRate*days);
		}
		
		
		public String toString()
		{
			return " Bush X:" + xC + " Y:" + yC + " - Rate: "+ growthRate + " Height: " + height + " Width:" + width;
		}
		
		
		
}

	
	
	

