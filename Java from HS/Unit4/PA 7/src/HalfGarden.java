public class HalfGarden extends Garden  

{


public HalfGarden(int length, int width, int plants)

{

super(length, width, plants);

}


public void plantNewPlants(int plants)

{

for(int i = 0; i < plants/2; i++)

{

int x = (int)(Math.random()*Gwidth);

int y = (int)(Math.random()*Glength);

garden.add(new Bush(x,y));

}

for(int i = 0; i < plants/2; i++)

{

int x = (int)(Math.random()*Gwidth);

int y = (int)(Math.random()*Glength);

garden.add(new Flower(x,y));

}

}


public PlantInterface newPlant(int x, int y)

{

return null;

}



}