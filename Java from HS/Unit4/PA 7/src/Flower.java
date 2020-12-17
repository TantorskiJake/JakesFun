
public class Flower extends Plant implements PlantInterface

{
		
		public Flower(int xCoor, int yCoor) 
		{
			super(xCoor, yCoor);
			width = 8;
			height =30;
		}

		public void  grow(int days)
		{
			height = height + (growthRate*days);
		}
		
		public String toString()
		{
			return " Flower X:" + xC + " Y:" + yC + " - Rate: "+ growthRate + " Height: " + height + " Width:" + width;
		}
		
}

	
	
	

