import java.util.ArrayList;
public class FlowerGarden implements PlantInterface
{
	 private int gardenLength = 0, gardenWidth = 0;
	 int xC, yC;
	 int gardenFlowers;
	 private  ArrayList <PlantInterface> garden;
	    
	    public FlowerGarden(int width, int length, int flowers)
	    {
	    	garden = new ArrayList <PlantInterface>();
	    	gardenLength = length;
	    	gardenWidth = width;
	    	plantNewPlants(flowers);
	    	
	    	
	    }
	    
	    public void grow(int days)
	    {
	        for(int i = 0; i < garden.size(); i++)
	        {
	            garden.get(i).grow(days);
	        }
	    }
	    public void frost()
	    {
	        for(int i = 0; i < garden.size(); i++)
	        {
	            garden.get(i).frost();
	        }
	    }
	    public void rain(int days)
	    {
	        for(int i = 0; i < garden.size(); i++)
	        {
	            garden.get(i).rain(days);
	        }
	    }
	    public void draw()
	    {
	        System.out.println("Garden Width: " + gardenWidth + " Height: " + gardenLength + " Plants: " + garden.size());
	        for(int i = 0; i < garden.size(); i++)
	        {
	            garden.get(i).draw();
	        }
	    }
	    public void plantNewPlants(int numFlowers)
	    {
	        for(int i = 0; i < numFlowers; i++)
	        {
	            int x = (int)(0+Math.random()*gardenWidth);
	            int y = (int)(0+Math.random()*gardenLength);
	            Flower newFlower = new Flower(x,y);
	            garden.add(newFlower);
	        }
	    }
}
