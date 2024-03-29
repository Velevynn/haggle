// About.js (Josh)
import React from "react";
import "./pages.css";
import Bio from "../components/Bio";

function About() {
  return (
    <div style={{ margin: "25px", textAlign: "center" }}>
      <h1 style={{ fontFamily: "Newsreader, serif", fontSize: "3rem" }}>About</h1>
      <div className="team-container">
        <Bio
          name="Alex"
          bio="Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. 
        Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus."
        />

        <Bio
          name="Alexander"
          bio="Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. 
        Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus."
        />

        <Bio
          name="Joshua"
          bio="Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. 
        Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus."
        />

        <Bio
          name="Jimmy"
          bio="
          Hi there, I'm Jimmy, a third-year computer science major at Cal Poly. I thrive on the challenges 
          of coding and problem-solving, both in and out of the classroom. Beyond my studies, I'm always 
          diving into creative tech projects, driven by a passion to make a mark in the ever-evolving world 
          of technology. My goal? To contribute innovatively and shape the future through my love for 
          coding and exploration of cutting-edge solutions."
        />

        <Bio
          name="Karan"
          bio="Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. 
        Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus."
        />
      </div>
    </div>
  );
}

export default About;
