public class HalfGardenDriver 

{

public static void main(String[] args)

{

HalfGarden hGarden = new HalfGarden(400,600,6);

hGarden.draw();

System.out.println("Growing for 2 Days");

hGarden.grow(2);

hGarden.draw();

System.out.println("Raining for 5 Days and Growing for 2 Days");

hGarden.rain(5);

hGarden.grow(2);

hGarden.draw();

System.out.println("Growing for 1 day");

hGarden.grow(1);

hGarden.draw();

System.out.println("Frost Happens");

hGarden.frost();

hGarden.draw();

System.out.println();

}

}