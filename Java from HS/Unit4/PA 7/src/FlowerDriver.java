
public class FlowerDriver {

	public static void main(String[] args) 
	{
		Flower myFlower = new Flower(20,40);
		myFlower.draw();
		System.out.println("growing 2 days");
		myFlower.grow(2);
		myFlower.draw();
		System.out.println("raining 5 and growing 2 days");
		myFlower.rain(5);
		myFlower.grow(2);
		myFlower.draw();
		System.out.println("growing 1 day");
		myFlower.grow(1);
		myFlower.draw();
		System.out.println("Frost happens");
		myFlower.frost();
		myFlower.draw();
		System.out.println();
	}


}
