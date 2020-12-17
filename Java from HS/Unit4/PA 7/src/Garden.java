import java.util.ArrayList;



public abstract class Garden implements PlantInterface 

{


protected ArrayList<PlantInterface> garden;


protected int Glength, Gwidth, NUMplant;


int xC, yC;

double height, width, growthRate;


public Garden(int length, int width, int plants)

{

garden = new ArrayList<PlantInterface>();


Glength = length;

Gwidth = width;

NUMplant = plants;

plantNewPlants(plants);

}


public void grow(int days)

{

for(int i = 0; i < garden.size(); i++)

{

garden.get(i).grow(days);

}

}


public void rain(int days)

{

for(int i = 0; i < garden.size(); i++)

{

garden.get(i).rain(days);

}

}


public void frost()

{

for(int i = 0; i < garden.size(); i++)

{

garden.get(i).frost();

}

}


public void draw()

{

System.out.println("Garden Width: " + Gwidth + " Height: " + Glength + " Plants: " + garden.size());

for(int i = 0; i < garden.size(); i++)

{

garden.get(i).draw();

}

System.out.println();

}


public abstract PlantInterface newPlant(int x, int y);


public void plantNewPlants(int plants)

{

for(int i = 0; i < plants; i++)

{

int x = (int)(Math.random()*Gwidth);

int y = (int)(Math.random()*Glength);

Flower newFlower = new Flower(x,y);

        garden.add(newFlower);

}




}







}

