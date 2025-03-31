import React, { useState } from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Button, List, ListItem } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface Category {
  id: number;
  name: string;
  subcategories: string[];
}

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [subcategories, setSubcategories] = useState<{ [key: number]: string }>({});

  // Add a new category
  const addCategory = () => {
    if (newCategory.trim()) {
      setCategories([...categories, { id: Date.now(), name: newCategory, subcategories: [] }]);
      setNewCategory("");
    }
  };

  // Add a subcategory
  const addSubcategory = (categoryId: number) => {
    if (subcategories[categoryId]?.trim()) {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? { ...cat, subcategories: [...cat.subcategories, subcategories[categoryId]] }
            : cat
        )
      );
      setSubcategories({ ...subcategories, [categoryId]: "" });
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 20 }}>
      <Typography variant="h5" gutterBottom>
        Expense Categories
      </Typography>

      {/* Input for adding new category */}
      <TextField
        label="New Category"
        variant="outlined"
        fullWidth
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        sx={{ marginBottom: 2 }}
      />
      <Button variant="contained" onClick={addCategory} fullWidth>
        Add Category
      </Button>

      {/* List of categories */}
      <List>
        {categories.map((category) => (
          <ListItem key={category.id} sx={{ flexDirection: "column", alignItems: "start" }}>
            <Accordion sx={{ width: "100%" }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">{category.name}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {category.subcategories.map((sub, index) => (
                    <ListItem key={index}>{sub}</ListItem>
                  ))}
                </List>
                <TextField
                  label="New Subcategory"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={subcategories[category.id] || ""}
                  onChange={(e) =>
                    setSubcategories({ ...subcategories, [category.id]: e.target.value })
                  }
                  sx={{ marginBottom: 1 }}
                />
                <Button variant="contained" size="small" onClick={() => addSubcategory(category.id)}>
                  Add Subcategory
                </Button>
              </AccordionDetails>
            </Accordion>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default CategoryManager;
