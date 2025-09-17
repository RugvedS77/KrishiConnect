# # schemas/__init__.py

# # 1. Import all your individual schema modules as before
# from . import user_schema
# from . import croplist_schema
# from . import wallet_schema
# from . import auth_schema
# # from . import contract_schema # Add others as you create them

# # 2. THE FIX: Manually update the module namespaces to break the circular dependency.
# #    This makes the CropList class available inside the user_schema module, and vice-versa.
# user_schema.CropList = croplist_schema.CropList
# croplist_schema.User = user_schema.User

# # 3. Now, resolve the forward references. This will succeed because the names are now defined.
# user_schema.User.model_rebuild()
# croplist_schema.CropList.model_rebuild()