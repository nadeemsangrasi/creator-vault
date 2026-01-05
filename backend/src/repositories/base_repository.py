"""Base repository pattern for generic CRUD operations."""
from typing import TypeVar, Generic, Type, Optional, Any
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import SQLModel

ModelType = TypeVar("ModelType", bound=SQLModel)


class BaseRepository(Generic[ModelType]):
    """Generic repository for database operations."""

    def __init__(self, model: Type[ModelType], session: AsyncSession):
        """
        Initialize repository with model type and database session.

        Args:
            model: SQLModel class
            session: Async database session
        """
        self.model = model
        self.session = session

    async def create(self, obj: ModelType) -> ModelType:
        """
        Create a new record.

        Args:
            obj: Model instance to create

        Returns:
            Created model instance with database-generated fields
        """
        self.session.add(obj)
        await self.session.flush()
        await self.session.refresh(obj)
        return obj

    async def get_by_id(self, id: UUID) -> Optional[ModelType]:
        """
        Get record by ID.

        Args:
            id: Record UUID

        Returns:
            Model instance or None if not found
        """
        result = await self.session.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()

    async def update(self, obj: ModelType) -> ModelType:
        """
        Update existing record.

        Args:
            obj: Model instance with updated fields

        Returns:
            Updated model instance
        """
        self.session.add(obj)
        await self.session.flush()
        await self.session.refresh(obj)
        return obj

    async def delete(self, obj: ModelType) -> None:
        """
        Delete record.

        Args:
            obj: Model instance to delete
        """
        await self.session.delete(obj)
        await self.session.flush()

    async def count(self, **filters: Any) -> int:
        """
        Count records matching filters.

        Args:
            **filters: Field filters

        Returns:
            Number of matching records
        """
        query = select(func.count()).select_from(self.model)
        for key, value in filters.items():
            if value is not None:
                query = query.where(getattr(self.model, key) == value)
        result = await self.session.execute(query)
        return result.scalar() or 0
