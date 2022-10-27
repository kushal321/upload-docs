import React, { useState, useEffect } from "react";
import "./index.css";
import axios from "axios";

export default function App() {
  const initialState = {fileName: "", file: null };
  const [formValues, setFormValues] = useState(initialState);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);
  const allowedFileTypes = ["pdf"];
  const [docs, setDocs] = useState([]);
  const isDocsPresent = docs.length;

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormValues({ ...formValues, [name]: value });
    
  }

  const handleFileUpload = (e) => {
    let file = e.target.files[0];
    let reader = new FileReader();

    const {name, value} = e.target;
    setSelectedFile(e.target.files[0]);
    reader.readAsDataURL(file);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormErrors(validate(formValues, selectedFile));
    setIsSubmit(true);
    submitDoc(formValues, selectedFile)
  }

  const submitDoc = async (fileName, file) => {

    const formData = new FormData();
    formData.append('file', file);
    axios.post('https://cors-everywhere.herokuapp.com/http://netcrackerapp-env.eba-am5ppfnb.ap-south-1.elasticbeanstalk.com/upload-doc', formData, {
      params: {
        fileName: formValues.fileName
      }
    })
    .then(response => {
      // docs.push(response.data);
      // setDocs(docs);
      setDocs([...docs, response.data])
    }).catch(e => {
      console.log(e)
    })
  }

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetch('https://cors-everywhere.herokuapp.com/http://netcrackerapp-env.eba-am5ppfnb.ap-south-1.elasticbeanstalk.com/get-all-docs');
      const jsonResult = await result.json();
      setDocs(...docs, jsonResult);
    }

    fetchData()
  }, [])

  const validate = (values, files) => {
    const errors = {};
    if(!values.fileName) {
      errors.fileName = "File Name is required";
    }
    if(files === null) {
      errors.file = "File Path is required";
    } else if(files.size > 1e6) {
      errors.file = "File Size is greater than 1 MB";
    } else if (!allowedFileTypes.includes(files.name.split(".").at(-1))) {
      errors.file = "File Path is not in pdf format";
    }
    return errors;
  }


  return (
    <div class="form-container">
      <form class="register-form" onSubmit={handleSubmit}>
        <input 
          id="file-name"
          class="form-field"
          type="text"
          placeholder="File Name"
          name="fileName"
          value={formValues.fileName}
          onChange = {handleChange}
        />
        <p style={{color: "red"}}>{formErrors.fileName}</p>
        <input
          id="last-name"
          class="form-field"
          type="file"
          name="file"
          value={formValues.file}
          onChange = {handleFileUpload}
        />
        <p style={{color: "red"}}>{formErrors.file}</p>
        <button class="form-field" type="submit">
          Submit
        </button>
      </form>
      {
        docs.length > 0 &&
        <div class="past-docs">
        <h3>Past uploaded docs</h3>
          {docs.map(doc =>
              <div key={doc.fileName}>
                <a href={doc.url} target="_blank">{doc.actualFileName === null ? "Dummy file": doc.actualFileName}</a>
                <hr/>
              </div>
          )}
      </div>
      }
    </div>
  );
}