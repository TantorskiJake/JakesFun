
public abstract class Plant implements PlantInterface
{
	protected int xC;
	protected int yC;
	protected  double height;
	protected  double width;
	protected double growthRate;
	
	public Plant(int xCoord, int yCoord)
	{
		
		xC = xCoord;
		yC = yCoord;
	}
	public void  grow(int days)
	{
		height = height + (growthRate*days);
	}
	public void rain(int days)
	{
		growthRate = (growthRate + (days * .10));
	}
	public void frost()
	{
		height = 0;
		width = 0;
		growthRate=0;
	}
	
	
	public abstract String toString();
	
	public void draw()
	{
		System.out.println(toString());
	}
	
	
}
