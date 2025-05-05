# Polygon Triangulation & Frieze Pattern Generator

A web application that allows users to create polygons, triangulate them with diagonals, and generate the associated integer frieze patterns.


## Live Demo

Visit the live application: [https://karinmja.github.io/integer-friezes/](https://karinmja.github.io/integer-friezes/)

## Features

- **Polygon Creation**: Draw polygons with 4-50 vertices
- **Interactive Triangulation**: Add diagonals to create triangulations while ensuring no diagonals cross
- **Frieze Pattern Generation**: Calculate and display the associated integer frieze pattern for completed triangulations
- **Diagonal Mutation**: Perform diagonal flips to explore different triangulations while maintaining a maximal set of non-crossing diagonals

## Technologies Used

- JavaScript (vanilla)
- HTML5 Canvas for drawing and interaction
- CSS for styling
- GitHub Pages for deployment
- Developed with assistance from GitHub Copilot

## Mathematical Background

This application explores the relationship between:
- Triangulations of polygons (maximal sets of non-crossing diagonals)
- Integer frieze patterns as described by Conway and Coxeter
- Diagonal mutations (flips) that transform one triangulation into another

## Installation & Local Development

1. Clone the repository.

2. No build process is required. Simply open `index.htm` in your browser to run the application locally.

## Usage Instructions

1. **Create a Polygon**:
   - The application starts with a polygon of 7 vertices, but you can choose from 4 to 50 (beyond that the user interface becomes unwieldy, but feel free to change this in your own fork of the code!)
   - Adjust the number of vertices using the controls provided
   
2. **Add Diagonals**:
   - Click on two non-adjacent vertices to create a diagonal
   - The application will only allow diagonals that don't cross existing ones
   
3. **Complete Triangulation**:
   - Continue adding diagonals until you have a maximal set (full triangulation)
   - The application will indicate below when the triangulation is complete.
   
4. **Generate Frieze Pattern**:
   - Once triangulation is complete, the associated integer frieze pattern will be calculated and displayed
   
5. **Manipulate Diagonals**:
   - Click on an existing diagonal to delete or mutate it - the latter option is only available once you have a full triangulation.
   - Observe how the frieze pattern changes with different triangulations!

## Mathematical Details

### Frieze Patterns

Frieze patterns are arrays of numbers with specific properties, discovered by Conway and Coxeter. For a triangulated n-gon:

1. The frieze pattern has n-3 rows
2. The top and bottom rows consist entirely of 0's, and the second and penultimate rows consist entirely of 1's
3. Each diamond of adjacent numbers satisfies the relation: ad - bc = 1
4. The pattern is closely related to the combinatorial structure of the triangulation

### Diagonal Mutations

When a diagonal is "flipped" in a triangulation:
- It transforms one triangulation into another
- The two triangulations differ by exactly one diagonal
- This operation corresponds to a specific transformation of the associated frieze pattern

## Contributing

Contributions are welcome! Feel free to submit a pull request or create an issue to discuss potential improvements.

## Credits

- Developed by Karin M. Jacobsen
- Mathematical concepts based on the work of Conway and Coxeter on frieze patterns
- Built with assistance from GitHub Copilot

## License

This project is licensed under the MIT License - see the LICENSE file for details.
