
public interface PlantInterface 
{

	//modify the size of the plant to reflect growing "days" days.
	void grow(int days);
	
	//modify the rate of the plant.
	void rain(int days);
	
	//modify the size of the plant to reflect the effects of a frost
	void frost();
	
	//displays the plant with its current location and size
	void draw();

}