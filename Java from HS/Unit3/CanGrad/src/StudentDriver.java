import javax.swing.JOptionPane;
public class StudentDriver {

	public static void main(String[] args) {
		int honors;
		
		Student classYear = new Student();
		
		String classYear = JOptionPane.showInputDialog("Enter a year: ");
		
		honors = Integer.parseInt (classYear); 
		
		JOptionPane.showMessageDialog (null, classYear.isEligibleForHonors(int classYear , double gpa)); 


	}

}
