
public class FlowerGardenDriver 
{
	public static void main(String[] args)
	{
		FlowerGarden backyard = new FlowerGarden(400, 600, 6);
		backyard.draw();
		FlowerGarden sideyard = new FlowerGarden(300, 400, 6);
		System.out.println("growing");
		sideyard.grow(1);
		backyard.grow(1);
		backyard.draw();
		sideyard.draw();
		backyard.rain(5);
		System.out.println("growing");
		backyard.grow(1);
		backyard.draw();
		System.out.println("Frost happens");
		backyard.frost();
		backyard.draw();
		System.out.println("Adding new flowers to backyard");
		backyard.plantNewPlants(12);
		backyard.draw();
	}

}
